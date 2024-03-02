import { refreshClient } from '@/utils/api'
import { Session, Keys } from '@/utils/session'
import * as token from '@/utils/token'

beforeEach(() => {
  jest.spyOn(token, 'clearToken').mockImplementation(() => undefined)
  jest.spyOn(token, 'setToken').mockImplementation(() => undefined)
  jest.spyOn(token, 'setTokenExpiration').mockImplementation(() => undefined)
  jest.spyOn(token, 'setRefreshToken').mockImplementation(() => undefined)
  jest.spyOn(token, 'getRefreshToken').mockImplementation(() => null)
  jest.spyOn(token, 'clearToken').mockImplementation(() => undefined)
  jest.spyOn(token, 'clearRefreshToken').mockImplementation(() => undefined)
  jest.spyOn(token, 'getRefreshTokenSource').mockImplementation(() => null)
  jest.spyOn(token, 'getTokenLifetimeLeft').mockImplementation(() => 0)
})
let session: Session

beforeEach(() => {
  session = new Session()
})

describe('logout', () => {
  beforeEach(() => {
    session.authenticate({
      refreshToken: 'foo', token: 'bar', tokenExpiration: '2050-01-01T00:00:00'
    })
  })

  it('triggers logout event as user triggered', () => {
    const spy = jest.fn()
    session.onLogout(spy)
    session.logout()
    expect(spy).toHaveBeenCalledWith(true)
  })
})

describe('logout when logged in via sharing refresh token', () => {
  beforeEach(() => {
    const event = new StorageEvent('storage', { key: Keys.RefreshTokenResponse, newValue: 'true' })
    window.dispatchEvent(event)
  })

  it('triggers logout event as user triggered', () => {
    const spy = jest.fn()
    session.onLogout(spy)
    session.logout()
    expect(spy).toHaveBeenCalledWith(true)
  })
})

describe('auto-logout via storage event', () => {
  beforeEach(() => {
    session.authenticate({
      refreshToken: 'foo', token: 'bar', tokenExpiration: '2050-01-01T00:00:00'
    })
  })

  it('triggers logout event as automated', () => {
    const spy = jest.fn()
    session.onLogout(spy)

    const event = new StorageEvent('storage', { key: Keys.LogoutRequest, newValue: 'true' })
    window.dispatchEvent(event)

    expect(spy).toHaveBeenCalledWith(false)
  })
})

describe('updateAccessToken', () => {
  let spy: jest.Mock

  beforeEach(() => {
    session.authenticate({
      refreshToken: 'foo', token: 'bar', tokenExpiration: '2050-01-01T00:00:00'
    })

    spy = jest.fn()
    session.onLogout(spy)

    jest.spyOn(refreshClient, 'get').mockImplementation(() => Promise.resolve())
  })

  describe('when request fails with 401', () => {
    beforeEach(() => {
      jest.spyOn(refreshClient, 'get').mockRejectedValue({ response: { status: 401 } })
    })

    it('triggers logout event as automated', async () => {
      await session.updateAccessToken()
      expect(spy).toHaveBeenCalledWith(false)
    })
  })

  describe('when request fails with random reason', () => {
    beforeEach(() => {
      jest.spyOn(refreshClient, 'get').mockRejectedValue({})
    })

    it('does not trigger logout', async () => {
      await session.updateAccessToken()
      expect(spy).not.toHaveBeenCalledWith(false)
    })
  })
})
