import { refreshClient } from './api'
import { isErrorResponse } from './error/types'
import {
  clearRefreshToken,
  clearToken,
  getRefreshToken,
  getRefreshTokenSource,
  getToken,
  getTokenLifetimeLeft,
  setRefreshToken,
  setToken,
  setTokenExpiration
} from './token'

const { localStorage } = window

export enum Keys {
  RefreshTokenRequest = 'refresh_token_request',
  RefreshTokenResponse = 'refresh_token_response',
  LogoutRequest = 'logout_request'
}

/**
 * Receive and set refresh token from anothetr tab
 *
 * Setting does not dispatch same event, so no reason to check value.
 */
const receiveRefreshTokenFromOtherTabs = (refreshToken: string): void => {
  const source = getRefreshTokenSource()
  const isPermanent = source === 'local'
  setRefreshToken(refreshToken, isPermanent)
}

/**
 * Request a refresh token from other tabs.
 *
 * Hapens on page load.
 */
const requestRefreshTokenFromOtherTabs = (): void => {
  localStorage.setItem(Keys.RefreshTokenRequest, 'sessions')
  localStorage.removeItem(Keys.RefreshTokenRequest)
}

/**
 * Send refresh token to other tabs.
 *
 * Happens on login
 */
const sendRefreshTokenToOtherTabs = (): void => {
  const data = getRefreshToken()
  if (data) {
    localStorage.setItem(Keys.RefreshTokenResponse, data)
    localStorage.removeItem(Keys.RefreshTokenResponse)
  }
}

/**
 * Send logout to other tabs.
 *
 * Hapens on current tab explicit logout.
 */
const sendLogoutToOtherTabs = (isPermanent: boolean): void => {
  localStorage.setItem(Keys.LogoutRequest, isPermanent.toString())
  localStorage.removeItem(Keys.LogoutRequest)
}

type AuthenticationPayload = {
  isPermanent?: boolean
  refreshToken: string
  token: string
  tokenExpiration: string
}

type TokenPayload = {
  token: string
  tokenExpiration: string
}

/**
 * Defines all supported session events
 */
enum SessionEvent {
  /**
   * Triggered when the user logs out here, or in a different tab
   */
  Logout = 'logout'
}

/**
 * Handles sync of user's session within a single tab as well as across tabs.
 *
 * When the user logs in, token data is set into local/session storage.
 *
 * When the user logs out, this is synced to other tabs using storage events, so
 * other tabs can logout to.
 *
 * When a new tab is open, a refresh token is requested from previous tabs.
 *
 * When a refresh token is requested from another tab, it is sent if available.
 */
export class Session {
  /**
   * Indicate if session is currently in authenticated state
   *
   * Used to prevent multiple logout attempts.
   */
  private isAuthenticated: boolean = false

  /**
   * Indicate if user clicked "remember me" when logging in.
   *
   * If this flag is active, the tokens are stored into local,
   * rather than session storage.
   */
  private isPermanent: boolean = false

  constructor () {
    // listen for changes to localStorage
    if (window.addEventListener) {
      window.addEventListener('storage', (e) => this.onStorageEvent(e), false)
    } else {
      // old browser compatibility, legacy code, possibly not necessary
      (window as any).attachEvent('onstorage', () => this.onStorageEvent())
    }

    // another tab might have a valid refresh token in session
    // session storage is not shared between tabs, so it needs to be requested
    requestRefreshTokenFromOtherTabs()

    // a valid access token means we're authenticated
    // refresh token is not needed for this
    if (getToken() && getTokenLifetimeLeft() > 0) {
      this.isAuthenticated = true
    }
  }

  /**
   * Binds to storage events, which trigger when another browser tab
   * on the same domain stores something into local or sessions storage
   */
  private onStorageEvent (e?: StorageEvent) {
    // old browser compatibility, legacy code, possibly not necessary
    const event = e || window.event as StorageEvent

    // the refresh token has changed
    if (event.key === Keys.RefreshTokenResponse) {
      if (event.newValue) {
        receiveRefreshTokenFromOtherTabs(event.newValue)
        // we might not have been authenticated before,
        // because the access token expired on page load, but we are now
        this.isAuthenticated = true
      }
    }

    // a newly opened tab requested the refresh token from an older tab
    if (event.key === Keys.RefreshTokenRequest && event.newValue !== null) {
      sendRefreshTokenToOtherTabs()
    }

    // user has logged out in another tab
    if (event.key === Keys.LogoutRequest && event.newValue !== null) {
      this.logoutSelf(false)
    }
  }

  /**
   * Authenticate session for user
   *
   * Set all tokens and send refresh token to other open tabs
   */
  public authenticate (payload: AuthenticationPayload) {
    const isPermanent = payload.isPermanent === undefined
      ? this.isPermanent
      : payload.isPermanent

    setToken(payload.token)
    setTokenExpiration(payload.tokenExpiration)
    setRefreshToken(payload.refreshToken, isPermanent)
    sendRefreshTokenToOtherTabs()

    this.isAuthenticated = true
  }

  /**
   * Updates user's access token within this tab
   */
  public updateToken (payload: TokenPayload) {
    setToken(payload.token)
    setTokenExpiration(payload.tokenExpiration)
  }

  /**
   * Holds all currently bound callbacks for session events
   */
  private callbacks: { [k in SessionEvent]: Function [] } = {
    [SessionEvent.Logout]: []
  }

  /**
   * Bind to a session event of a specific type.
   *
   * Use the `SessionEvent` enum to specify event.
   */
  private on (event: SessionEvent, callback: Function): void {
    this.callbacks[event].push(callback)
  }

  /**
   * Bind callback to `SessionEvent.Logout` event
   * @param {Function} callback
   *
   * Function to call when the event triggers. A boolean argument is passed into
   * the callback, indicating if the logout was triggered by user from this tab (true),
   * or automatically due to logging out from another tab or token expiring (false).
   */
  public onLogout (callback: (userTriggered: boolean) => any): void {
    this.on(SessionEvent.Logout, callback)
  }

  /**
   * Temporarily stores a request to refresh the access token when it has expired
   *
   * Used to avoid multiple refresh requests from the backend.
   */
  private refreshAccessTokenRequest: null | Promise<any> = null

  /**
   * Requests a new access-token using the stored refresh token.
   *
   * The request is memoized while in progress, and is attached to by subsequent requests,
   * to avoid firing multiple requests in paralel.
   *
   * If the refresh token is missing or has expired, the logout process is triggered.
   */
  public async updateAccessToken (): Promise<{ data?: any, error?: any }> {
    if (!this.refreshAccessTokenRequest) {
      this.refreshAccessTokenRequest = refreshClient.get('refresh')
    }

    // eslint-disable-next-line camelcase
    let response: { data: { token: string, token_expiration: string } }

    try {
      response = await this.refreshAccessTokenRequest
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      const refreshTokenLikelyExpired = error.response && error.response.status === 401
      if (refreshTokenLikelyExpired) { this.logoutSelf(false) }
      return { error }
    } finally {
      this.refreshAccessTokenRequest = null
    }

    this.updateToken({
      token: response.data.token,
      tokenExpiration: response.data.token_expiration
    })

    return response
  }

  /**
   * Checks remaining lifetime of access token and refreshes if necessary
   */
  maybeRefreshAccessToken () {
    if (getTokenLifetimeLeft() >= 10) { return }
    this.updateAccessToken()
  }

  /**
   * Logs out current tab only.
   *
   * @param {boolean} userTriggered
   *
   * Indicates if the function was called in an automated way or directly.
   *
   * Automated logout happens when the user logged out directly fron another tab,
   * or when the token expired.
   */
  private logoutSelf (userTriggered: boolean = true): void {
    this.clearTokens()

    // prevents same callbacks from running over and over again
    if (!this.isAuthenticated) { return }

    this.callbacks[SessionEvent.Logout].forEach(c => c(userTriggered))
    this.isAuthenticated = false
  }

  private clearTokens (): void {
    clearToken()
    clearRefreshToken()
  }

  /**
   * Logs out current tab and notifies other tabs of logout, using storage events
   */
  public logout (): void {
    // we don't want callbacks to run multiple times
    this.logoutSelf()
    sendLogoutToOtherTabs(!!this.isPermanent)
  }
}

const session = new Session()
export default session
