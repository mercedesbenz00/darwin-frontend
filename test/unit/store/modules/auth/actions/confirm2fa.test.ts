import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { mockToken } from 'test/unit/mocks/mockToken'

import { api, errorsByCode } from '@/utils'
import * as token from '@/utils/token'

const localVue = createLocalVue()
localVue.use(Vuex)

const unauthorizedError = {
  response: { status: 401 }
}

let store: ReturnType<typeof createUnstubbedTestStore>

mockApi()
mockToken()

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('auth/confirm2fa with email and password', () => {
  const params = { email: 'joe@v7labs.com', password: 'FakePassword', token: '123456' }

  beforeEach(() => jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: {} })))

  it('sends api request', async () => {
    await store.dispatch('auth/confirm2fa', params)
    expect(api.post).toHaveBeenCalledWith('users/confirm_2fa', params)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/confirm2fa', params)
    expect(data).toEqual({})
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/confirm2fa', params)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_CONFIRM_2FA
      })
    )
  })
})

describe('auth/confirm2fa with access token', () => {
  const params = { token: '123456' }

  beforeEach(() => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: {} }))
    jest.spyOn(token, 'getToken').mockReturnValue('token')
  })

  it('sends api request', async () => {
    await store.dispatch('auth/confirm2fa', params)
    expect(api.post).toHaveBeenCalledWith('users/confirm_2fa', {
      access_token: 'token',
      token: '123456'
    })
  })

  it('returns error when token is null or undefined', async () => {
    jest.spyOn(token, 'getToken').mockReturnValue(null)
    const { error } = await store.dispatch('auth/confirm2fa', params)
    expect(error.message).toEqual(errorsByCode.AUTH_CONFIRM_2FA)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/confirm2fa', params)
    expect(data).toEqual({})
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/confirm2fa', params)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_CONFIRM_2FA
      })
    )
  })
})
