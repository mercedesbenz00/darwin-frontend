import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildUserPayload,
  buildTeamPayload,
  buildMembershipPayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { mockSession } from 'test/unit/mocks/mockSession'

import {
  Ability,
  LoginResponsePayload
} from '@/store/types'
import { api, errorsByCode } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

const unauthorizedError = {
  response: { status: 401 }
}

const viewTeam: Ability = {
  actions: ['view_team'],
  conditions: {},
  subject: 'all'
}

const sam = buildUserPayload({ id: 1, first_name: 'Sam' })
const v7 = buildTeamPayload({ id: 7, name: 'v7' })
const samV7Membership = buildMembershipPayload({ id: 1, user_id: 1, team_id: 1 })

let loginResponse: { data: LoginResponsePayload }
let store: ReturnType<typeof createUnstubbedTestStore>

mockApi()
mockSession()

beforeEach(() => {
  store = createUnstubbedTestStore()

  loginResponse = {
    data: {
      ...sam,
      memberships: [samV7Membership],
      refresh_token: 'fake_refresh_token',
      selected_team_abilities: [viewTeam],
      selected_team: v7,
      teams: [v7],
      token_expiration: 'fake_expiration',
      token: 'fake_token'
    }
  }
})

describe('auth/login2fa', () => {
  const params = { email: 'joe@v7labs.com', password: 'FakePassword', token: '123456' }

  beforeEach(() => jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse(loginResponse)))

  it('sends api request', async () => {
    await store.dispatch('auth/login2fa', params)
    expect(api.post).toHaveBeenCalledWith('users/authenticate/2fa', params)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/login2fa', params)
    expect(data).toEqual(loginResponse.data)
  })

  it('sets authenticated', async () => {
    await store.dispatch('auth/login2fa', params)
    expect(store.state.auth.authenticated).toBe(true)
  })

  it('sets abilities', async () => {
    await store.dispatch('auth/login2fa', params)
    expect(store.state.auth.abilities).toEqual(loginResponse.data.selected_team_abilities)
  })

  it('sets user profile', async () => {
    await store.dispatch('auth/login2fa', params)
    expect(store.state.user.profile).toEqual(loginResponse.data)
  })

  it('sets current team', async () => {
    await store.dispatch('auth/login2fa', params)
    expect(store.state.team.currentTeam).toEqual(loginResponse.data.selected_team)
  })

  it('sets teams', async () => {
    await store.dispatch('auth/login2fa', params)
    expect(store.state.team.teams).toEqual(loginResponse.data.teams)
  })

  it('reloads features', async () => {
    await store.dispatch('auth/login2fa', params)
    expect(store.dispatch).toHaveBeenCalledWith('features/getFeatures', {})
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/login2fa', params)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_CONFIRM_2FA
      })
    )
  })
})
