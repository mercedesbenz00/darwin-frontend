import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildLogin2faResponsePayload,
  buildLoginResponsePayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { mockSession } from 'test/unit/mocks/mockSession'

import {
  Login2FAResponsePayload,
  LoginResponsePayload
} from '@/store/types'
import { api, errorsByCode } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

const unauthorizedError = {
  response: { status: 401 }
}

let loginResponse: { data: LoginResponsePayload }
let login2faResponse: { data: Login2FAResponsePayload }
let store: ReturnType<typeof createUnstubbedTestStore>

mockApi()
mockSession()

beforeEach(() => {
  store = createUnstubbedTestStore()

  loginResponse = {
    data: buildLoginResponsePayload()
  }

  login2faResponse = {
    data: buildLogin2faResponsePayload()
  }
})

describe('auth/login without 2fa', () => {
  const params = { email: 'joe@v7labs.com', password: 'FakePassword' }

  beforeEach(() => jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse(loginResponse)))

  it('sends api request', async () => {
    await store.dispatch('auth/login', params)
    expect(api.post).toHaveBeenCalledWith('users/authenticate', params)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/login', params)
    expect(data).toEqual(loginResponse.data)
  })

  it('sets authenticated', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.auth.authenticated).toBe(true)
  })

  it('sets abilities', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.auth.abilities).toEqual(loginResponse.data.selected_team_abilities)
  })

  it('sets user profile', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.user.profile).toEqual(loginResponse.data)
  })

  it('sets current team', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.team.currentTeam).toEqual(loginResponse.data.selected_team)
  })

  it('sets teams', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.team.teams).toEqual(loginResponse.data.teams)
  })

  it('reloads features', async () => {
    await store.dispatch('auth/login', params)
    expect(store.dispatch).toHaveBeenCalledWith('features/getFeatures', {})
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/login', params)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_LOGIN_INVALID_CREDENTIALS
      })
    )
  })
})

describe('auth/login with 2fa', () => {
  const params = { email: 'joe@v7labs.com', password: 'FakePassword' }

  beforeEach(() => jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse(login2faResponse)))

  it('sends api request', async () => {
    await store.dispatch('auth/login', params)
    expect(api.post).toHaveBeenCalledWith('users/authenticate', params)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/login', params)
    expect(data).toEqual(login2faResponse.data)
  })

  it('sets authenticated', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.auth.authenticated).toBe(false)
  })

  it('never sets abilities', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.auth.abilities).toEqual([])
  })

  it('never sets user profile', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.user.profile).toEqual(null)
  })

  it('never sets current team', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.team.currentTeam).toEqual(null)
  })

  it('never sets teams', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.team.teams).toEqual([])
  })

  it('never sets memberships', async () => {
    await store.dispatch('auth/login', params)
    expect(store.state.team.memberships).toEqual([])
  })

  it('never reloads features', async () => {
    await store.dispatch('auth/login', params)
    expect(store.dispatch).not.toHaveBeenCalledWith('features/getFeatures', {})
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/login', params)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_LOGIN_INVALID_CREDENTIALS
      })
    )
  })
})
