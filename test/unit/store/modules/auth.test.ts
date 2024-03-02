import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildInvitationPayload,
  buildUserPayload,
  buildTeamPayload,
  buildMembershipPayload
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { mockSession } from 'test/unit/mocks/mockSession'

import { getInitialState as authState } from '@/store/modules/auth'
import { getInitialState as teamState } from '@/store/modules/team/state'
import { getInitialState as userState } from '@/store/modules/user'
import {
  Ability,
  LoginResponsePayload
} from '@/store/types'
import { api, errorsByCode, session } from '@/utils'

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

// actions

describe('auth/forgotPassword', () => {
  const params = { email: 'joe@v7labs.com' }
  beforeEach(() => jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({})))

  it('sends api request', async () => {
    await store.dispatch('auth/forgotPassword', params)
    expect(api.post).toHaveBeenCalledWith('users/request_password_reset', params)
  })

  it('returns raw data', async () => {
    const response = await store.dispatch('auth/forgotPassword', params)
    expect(response.data).toEqual({})
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const { error } = await store.dispatch('auth/forgotPassword', params)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_FORGOT_PASSWORD
      })
    )
  })
})

describe('auth/passwordReset', () => {
  const viewTeam: Ability = {
    actions: ['view_team'],
    conditions: {},
    subject: 'all'
  }
  const sam = buildUserPayload({ id: 1, first_name: 'Sam' })
  const team = buildTeamPayload({ id: 7, name: 'v7' })
  const loginResponse: { data: LoginResponsePayload } = {
    data: {
      ...sam,
      memberships: [samV7Membership],
      refresh_token: 'fake_refresh_token',
      selected_team_abilities: [viewTeam],
      selected_team: team,
      teams: [team],
      token_expiration: 'fake_expiration',
      token: 'fake_token'

    }
  }

  const params = {
    token: 'fake_token', password: 'fake_password', confirm: 'fake_password'
  }

  beforeEach(() => jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse(loginResponse)))

  it('sends api request', async () => {
    await store.dispatch('auth/passwordReset', params)

    const expectedParams = {
      token: 'fake_token', password: 'fake_password', password_confirmation: 'fake_password'
    }

    expect(api.put).toHaveBeenCalledWith('users/reset_password', expectedParams)
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/passwordReset', params)
    expect(data).toEqual(loginResponse.data)
  })

  it('sets authenticated', async () => {
    await store.dispatch('auth/passwordReset', params)
    expect(store.state.auth.authenticated).toBe(true)
  })

  it('sets abilities', async () => {
    await store.dispatch('auth/passwordReset', params)
    expect(store.state.auth.abilities).toEqual(loginResponse.data.selected_team_abilities)
  })

  it('sets user profile', async () => {
    await store.dispatch('auth/passwordReset', params)
    expect(store.state.user.profile).toEqual(loginResponse.data)
  })

  it('sets current team', async () => {
    await store.dispatch('auth/passwordReset', params)
    expect(store.state.team.currentTeam).toEqual(loginResponse.data.selected_team)
  })

  it('sets teams', async () => {
    await store.dispatch('auth/passwordReset', params)
    expect(store.state.team.teams).toEqual(loginResponse.data.teams)
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/passwordReset', params)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_RESET_PASSWORD
      })
    )
  })
})

describe('auth/loginWithToken', () => {
  beforeEach(() => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse(loginResponse))
  })
  it('sends api request', async () => {
    await store.dispatch('auth/loginWithToken')
    expect(api.get).toHaveBeenCalledWith('users/token_info')
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('auth/loginWithToken')
    expect(data).toEqual(loginResponse.data)
  })

  it('sets authenticated', async () => {
    await store.dispatch('auth/loginWithToken')
    expect(store.state.auth.authenticated).toBe(true)
  })

  it('sets abilities', async () => {
    await store.dispatch('auth/loginWithToken')
    expect(store.state.auth.abilities).toEqual(loginResponse.data.selected_team_abilities)
  })

  it('sets user profile', async () => {
    await store.dispatch('auth/loginWithToken')
    expect(store.state.user.profile).toEqual(loginResponse.data)
  })

  it('sets current team', async () => {
    await store.dispatch('auth/loginWithToken')
    expect(store.state.team.currentTeam).toEqual(loginResponse.data.selected_team)
  })

  it('sets teams', async () => {
    await store.dispatch('auth/loginWithToken')
    expect(store.state.team.teams).toEqual(loginResponse.data.teams)
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/loginWithToken')
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_LOGIN_WITH_TOKEN
      })
    )
  })
})

describe('auth/logout', () => {
  beforeEach(() => jest.spyOn(api, 'logout').mockResolvedValue(buildAxiosResponse({})))

  it('sends api request', async () => {
    await store.dispatch('auth/logout')
    expect(api.logout).toHaveBeenCalledWith()
  })

  it('returns raw data', async () => {
    const response = await store.dispatch('auth/logout')
    expect(response.data).toEqual({})
  })

  it('leaves notifications channel', async () => {
    await store.dispatch('auth/logout')
    expect(store.dispatch).toHaveBeenCalledWith('notification/leaveNotificationsChannel', null)
  })

  it('resets global state', async () => {
    await store.dispatch('auth/logout')
    expect(store.state.auth).toEqual(authState())
    expect(store.state.user).toEqual(userState())
    expect(store.state.team).toEqual(teamState())
  })

  it('invokes logout on session', async () => {
    await store.dispatch('auth/logout')
    expect(session.logout).toHaveBeenCalled()
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'logout').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('auth/logout')
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_LOGOUT
      })
    )
  })
})

describe('auth/logoutStore', () => {
  beforeEach(() => jest.spyOn(api, 'logout').mockResolvedValue(buildAxiosResponse({})))
  const invoke = () => store.dispatch('auth/logoutStore')

  it('leaves notifications channel', async () => {
    await invoke()
    expect(store.dispatch).toHaveBeenCalledWith('notification/leaveNotificationsChannel', null)
  })

  it('resets global state', async () => {
    await invoke()
    expect(store.state.auth).toEqual(authState())
    expect(store.state.user).toEqual(userState())
    expect(store.state.team).toEqual(teamState())
  })

  it('does not invoke logout on session', async () => {
    await invoke()
    expect(session.logout).not.toHaveBeenCalled()
  })
})

describe('auth/verifyInvitation', () => {
  const validationResponse = { id: 1, email: 'james@v7labs.com', team: v7 }
  const mockResponse = buildAxiosResponse({ data: validationResponse })

  beforeEach(() => jest.spyOn(api, 'post').mockResolvedValue(mockResponse))

  const invoke = () => store.dispatch('auth/verifyInvitation', 'fakeToken')

  it('sends api request', async () => {
    await invoke()
    expect(api.post).toHaveBeenCalledWith('invitations/validate', { token: 'fakeToken' })
  })

  it('returns raw data', async () => {
    const response = await invoke()
    expect(response).toEqual(mockResponse)
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { error } = await invoke()
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_VERIFY_INVITATION
      })
    )
  })
})

describe('auth/selectTeam', () => {
  const params = {
    email: 'joe@v7labs.com',
    first_name: 'Joe',
    last_name: 'Smith',
    profession: 'Other',
    password: 'Password1',
    agreed_to_tos: true
  }

  const invoke = () => store.dispatch('auth/selectTeam', params)

  beforeEach(() => {
    jest.spyOn(api, 'selectTeam').mockResolvedValue(buildAxiosResponse(loginResponse))

    const { commit } = store
    store.commit = jest.fn().mockImplementation((mutation: string, data: any) => {
      if (mutation.indexOf('auth') === 0) {
        return commit(mutation, data)
      }
    })
  })

  it('sends api request', async () => {
    await invoke()
    expect(api.selectTeam).toHaveBeenCalledWith(params)
  })

  it('returns raw data', async () => {
    const { data } = await invoke()
    expect(data).toEqual(loginResponse.data)
  })

  it('sets abilities', async () => {
    await invoke()
    expect(store.state.auth.abilities).toEqual(loginResponse.data.selected_team_abilities)
  })

  it('resets store modules that need reseting', async () => {
    await invoke()
    expect(store.commit).toHaveBeenCalledWith('aclass/RESET_ALL', null, { root: true })
    expect(store.commit).toHaveBeenCalledWith('annotator/RESET_ALL', null, { root: true })
    expect(store.commit).toHaveBeenCalledWith('billing/RESET_ALL', null, { root: true })
    expect(store.commit).toHaveBeenCalledWith('comment/RESET_ALL', null, { root: true })
    expect(store.commit).toHaveBeenCalledWith('dataset/RESET_ALL', null, { root: true })
    expect(store.commit).toHaveBeenCalledWith('datasetUpload/RESET_ALL', null, { root: true })
    expect(store.commit).toHaveBeenCalledWith('neuralModel/RESET_ALL', null, { root: true })
    expect(store.commit).toHaveBeenCalledWith('workview/RESET_ALL', null, { root: true })
    expect(store.commit).toHaveBeenCalledWith('workviewTracker/RESET_ALL', null, { root: true })
  })

  it('sets current team', async () => {
    await invoke()
    expect(store.commit).toHaveBeenCalledWith('team/SET_CURRENT_TEAM', v7, { root: true })
  })

  it('sets teams', async () => {
    await invoke()
    expect(store.commit).toHaveBeenCalledWith('team/SET_TEAMS', [v7], { root: true })
  })

  it('reloads features', async () => {
    await invoke()
    expect(store.dispatch).toHaveBeenCalledWith('features/getFeatures', {})
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'selectTeam').mockRejectedValue(unauthorizedError)

    const { error } = await invoke()
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.AUTH_SELECT_TEAM
      })
    )
  })
})

// mutations

describe('auth/SET_AUTHENTICATED', () => {
  const mutate = (value: boolean) => store.commit('auth/SET_AUTHENTICATED', value)

  it('sets and unsets authenticated', () => {
    mutate(true)
    expect(store.state.auth.authenticated).toBe(true)

    mutate(false)
    expect(store.state.auth.authenticated).toBe(false)
  })
})

describe('auth/SET_ABILITIES', () => {
  it('sets abilities', () => {
    store.commit('auth/SET_ABILITIES', [])
    expect(store.state.auth.abilities).toEqual([])

    store.commit('auth/SET_ABILITIES', [viewTeam])
    expect(store.state.auth.abilities).toEqual([viewTeam])
  })
})

describe('auth/SET_INVITATION', () => {
  const mutate = (value: any) => store.commit('auth/SET_INVITATION', value)

  const invitation1 = buildInvitationPayload({ id: 1 })
  const invitation2 = buildInvitationPayload({ id: 2 })

  it('sets abilities', () => {
    mutate(invitation1)
    expect(store.state.auth.invitation).toEqual(invitation1)

    mutate(invitation2)
    expect(store.state.auth.invitation).toEqual(invitation2)
  })
})

describe('auth/RESET_ALL', () => {
  it('resets to initial state', () => {
    store.commit('auth/SET_AUTHENTICATED', true)
    store.commit('auth/SET_INVITATION', buildInvitationPayload({ id: 1 }))

    expect(store.state.auth).not.toEqual(authState())
    store.commit('auth/RESET_ALL')
    expect(store.state.auth).toEqual(authState())
  })
})
