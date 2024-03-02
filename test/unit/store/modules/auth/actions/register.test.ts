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

describe('auth/register', () => {
  const params = {
    email: 'joe@v7labs.com',
    firstName: 'Joe',
    lastName: 'Smith',
    profession: 'Other',
    password: 'Password1',
    agreedToTos: true,
    twoFactorAuthEnabled: true
  }

  beforeEach(() => jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse(loginResponse)))

  it('sends api request', async () => {
    await store.dispatch('auth/register', params)

    const payload = {
      email: 'joe@v7labs.com',
      first_name: 'Joe',
      last_name: 'Smith',
      hash: undefined,
      password: 'Password1',
      agreed_to_tos: true,
      token: undefined,
      two_factor_auth_enabled: true
    }

    expect(api.post).toHaveBeenCalledWith('users/register', payload)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/register', params)
    expect(data).toEqual(loginResponse.data)
  })

  it('sets authenticated', async () => {
    await store.dispatch('auth/register', params)
    expect(store.state.auth.authenticated).toBe(true)
  })

  it('sets abilities', async () => {
    await store.dispatch('auth/register', params)
    expect(store.state.auth.abilities).toEqual(loginResponse.data.selected_team_abilities)
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const { error } = await store.dispatch('auth/register', params)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_REGISTER
      })
    )
  })
})