import { TokenKeys, getTokenExpiration } from '@/utils'

import { Mock, StorageMock } from './storageMocks'

const now = Math.floor((new Date()).getTime() / 1000)

const addHours = (original: number, hours: number) => {
  return original + (hours * 3600 * 1000)
}

const timestamps = {
  now,
  inAnHour: addHours(now, 1),
  inTwoHours: addHours(now, 2)
}

describe('getTokenExpiration', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: new Mock() })
    Object.defineProperty(window, 'sessionStorage', { value: new Mock() })
  })

  it('returns 0 if no expiration set', () => {
    window.localStorage.removeItem(TokenKeys.AccessTokenExpiry)
    window.sessionStorage.removeItem(TokenKeys.AccessTokenExpiry)

    expect(getTokenExpiration()).toEqual(0)
  })

  it('returns value from local storage, as integer', () => {
    const sessionStorage = (window.sessionStorage as StorageMock)
    sessionStorage.setItem(TokenKeys.AccessTokenExpiry, timestamps.inTwoHours)

    const localStorage = (window.localStorage as StorageMock)
    localStorage.setItem(TokenKeys.AccessTokenExpiry, timestamps.inAnHour)

    expect(getTokenExpiration()).toEqual(timestamps.inAnHour)
  })
})
