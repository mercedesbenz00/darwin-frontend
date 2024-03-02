export enum TokenKeys {
  AccessToken = 'token',
  AccessTokenExpiry = 'token_expire',
  RefreshToken = 'refresh_token'
}

/** Stores refresh token either into local (if permanent) or session storage */
export const setRefreshToken = (refreshToken: string, isPermanent?: boolean) => {
  if (isPermanent) {
    localStorage.setItem(TokenKeys.RefreshToken, refreshToken)
    sessionStorage.removeItem(TokenKeys.RefreshToken)
  } else {
    sessionStorage.setItem(TokenKeys.RefreshToken, refreshToken)
    localStorage.removeItem(TokenKeys.RefreshToken)
  }
}

/** Clears refresh token from both local and session storage */
export const clearRefreshToken = () => {
  localStorage.removeItem(TokenKeys.RefreshToken)
  sessionStorage.removeItem(TokenKeys.RefreshToken)
}

/** Stores access token into local storage */
export const setToken = (token: string) => localStorage.setItem(TokenKeys.AccessToken, token)

/** Clears access token info from local storage */
export const clearToken = () => {
  localStorage.removeItem(TokenKeys.AccessToken)
  localStorage.removeItem(TokenKeys.AccessTokenExpiry)
}

/** Resolves access token expiration from local storage */
export const setTokenExpiration = (expiration: string) =>
  localStorage.setItem(TokenKeys.AccessTokenExpiry, expiration)

/** Resolves access token from local storage */
export const getToken = () => localStorage.getItem(TokenKeys.AccessToken)

/** Resolves refresh token, either from session or local storage */
export const getRefreshToken = () =>
  sessionStorage.getItem(TokenKeys.RefreshToken) || localStorage.getItem(TokenKeys.RefreshToken)

/** Resolves refresh token source depending on where it's stored */
export const getRefreshTokenSource = () =>
  sessionStorage.getItem(TokenKeys.RefreshToken)
    ? 'session'
    : localStorage.getItem(TokenKeys.RefreshToken)
      ? 'local'
      : null

/** Retreives token expiration as an integer */
export const getTokenExpiration = (): number => {
  const expiration = localStorage.getItem(TokenKeys.AccessTokenExpiry)
  if (!expiration) { return 0 }
  return parseInt(expiration)
}

/** Returns token lifetime left, in seconds */
export const getTokenLifetimeLeft = () => {
  const expiration = getTokenExpiration()
  if (!expiration) { return 0 }

  const now = (new Date()).getTime() / 1000
  return Math.floor(expiration - now)
}
