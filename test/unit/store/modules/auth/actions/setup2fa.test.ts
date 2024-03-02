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

describe('auth/setup2fa with email and password', () => {
  const credentials = {
    email: 'joe@v7labs.com',
    password: 'FakePassword'
  }

  beforeEach(() => {
    store.commit('auth/SET_2FA_CREDENTIALS', credentials)
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: { secret_2fa: 'secret_key' } }))
  })

  it('sends api request', async () => {
    await store.dispatch('auth/setup2fa')
    expect(api.post).toHaveBeenCalledWith('users/setup_2fa', credentials)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/setup2fa')
    expect(data).toEqual({ secret_2fa: 'secret_key' })
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/setup2fa')
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_SETUP_2FA
      })
    )
  })
})

describe('auth/setup2fa with access token', () => {
  beforeEach(() => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: { secret_2fa: 'secret_key' } }))
    jest.spyOn(token, 'getToken').mockReturnValue('token')
  })

  it('sends api request', async () => {
    await store.dispatch('auth/setup2fa')
    expect(api.post).toHaveBeenCalledWith('users/setup_2fa', { access_token: 'token' })
  })

  it('returns error when token is null or undefined', async () => {
    jest.spyOn(token, 'getToken').mockReturnValue(null)
    const { error } = await store.dispatch('auth/setup2fa')
    expect(error.message).toEqual(errorsByCode.AUTH_SETUP_2FA)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/setup2fa')
    expect(data).toEqual({ secret_2fa: 'secret_key' })
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/setup2fa')
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_SETUP_2FA
      })
    )
  })
})
