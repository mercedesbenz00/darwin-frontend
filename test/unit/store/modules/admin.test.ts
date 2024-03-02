import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAdminTeamPayload,
  buildAnnotationCreditPayload,
  buildAxiosResponse,
  buildTeamOwnerInvitationPayload,
  buildCustomerSubscriptionPayload
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { createCredit } from '@/store/modules/admin/actions/createCredit'
import { StoreActionPayload } from '@/store/types'
import { api, errorsByCode } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

let team1Payload: ReturnType<typeof buildAdminTeamPayload>
let team2Payload: ReturnType<typeof buildAdminTeamPayload>
let billingV3TeamPayload: ReturnType<typeof buildAdminTeamPayload>

beforeEach(() => {
  team1Payload = buildAdminTeamPayload({
    id: 1,
    name: 'V7',
    slug: 'v7',
    note: 'Note for V7 team',
    creation_date: '2019-12-30T20:27:23',
    dataset_count: 2,
    owner_email: 'user_name@v7labs.com',
    owner_first_name: 'User',
    owner_last_name: 'Name',
    user_count: 4
  })

  team2Payload = buildAdminTeamPayload({
    id: 2,
    name: 'Evil V7',
    slug: 'evil-v7',
    note: 'Note for Evil V7 team',
    creation_date: '2019-12-31T20:27:23',
    dataset_count: 1,
    owner_email: 'user_name@v7labs.com',
    owner_first_name: 'User',
    owner_last_name: 'Name',
    user_count: 1234
  })

  billingV3TeamPayload = buildAdminTeamPayload({
    id: 3,
    customer_v3: {
      customer_subscription: buildCustomerSubscriptionPayload({
        annotation_credits_standard: 100,
        annotation_credits_bonus: 20
      })
    }
  })
})

mockApi()

const unauthorizedError = { response: { status: 401 } }

describe('getTeams', () => {
  it('calls correct api endpoint', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [team1Payload, team2Payload] }))

    await store.dispatch('admin/getTeams')
    expect(api.get).toHaveBeenCalledWith('admin/teams')
  })

  it('returns raw data from backend', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [team1Payload, team2Payload] }))

    const { data } = await store.dispatch('admin/getTeams')
    expect(data).toEqual([team1Payload, team2Payload])
  })

  it('commits teams to store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [team1Payload, team2Payload] }))
    await store.dispatch('admin/getTeams')
    expect(store.state.admin.teams).toEqual([team1Payload, team2Payload])
  })

  it('returns error with parsed message', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('admin/getTeams')

    expect(response).toEqual({
      error: expect.objectContaining({
        message: errorsByCode.ADMIN_TEAMS_LOAD,
        status: 401
      })
    })
  })
})

describe('getTeam', () => {
  it('calls correct api endpoint', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: team1Payload }))

    await store.dispatch('admin/getTeam', team1Payload.id)
    expect(api.get).toHaveBeenCalledWith(`admin/teams/${team1Payload.id}`)
  })

  it('returns raw data from backend', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: team1Payload }))

    const { data } = await store.dispatch('admin/getTeam', team1Payload.id)
    expect(data).toEqual(team1Payload)
  })

  it('commits team to store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: team1Payload }))
    await store.dispatch('admin/getTeam', team1Payload.id)
    expect(store.state.admin.teams).toEqual([team1Payload])
  })

  it('returns error with parsed message', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('admin/getTeam', team1Payload.id)

    expect(response).toEqual({
      error: expect.objectContaining({
        message: errorsByCode.ADMIN_TEAM_LOAD,
        status: 401
      })
    })
  })
})

const teamOwnerInvitation1Payload = buildTeamOwnerInvitationPayload({
  id: 1,
  email: 'user1@example.com',
  credit_amount: 3600 * 1000,
  credit_expiration_in_days: 20,
  team: null
})

const teamOwnerInvitation2Payload = buildTeamOwnerInvitationPayload({
  id: 2,
  email: 'user2@example.com',
  credit_amount: 3600 * 1000,
  credit_expiration_in_days: 20,
  team: { id: 1, name: 'TEAM' }
})

describe('getTeamOwnerInvitations', () => {
  it('calls correct api endpoint', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({
      data: [teamOwnerInvitation1Payload, teamOwnerInvitation2Payload]
    }))

    await store.dispatch('admin/getTeamOwnerInvitations')
    expect(api.get).toHaveBeenCalledWith('admin/users/invitations')
  })

  it('returns raw data from backend', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({
      data: [teamOwnerInvitation1Payload, teamOwnerInvitation2Payload]
    }))

    const { data } = await store.dispatch('admin/getTeamOwnerInvitations')
    expect(data).toEqual([teamOwnerInvitation1Payload, teamOwnerInvitation2Payload])
  })

  it('commits invitations to store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({
      data: [teamOwnerInvitation1Payload, teamOwnerInvitation2Payload]
    }))
    await store.dispatch('admin/getTeamOwnerInvitations')
    expect(store.state.admin.teamOwnerInvitations).toEqual([teamOwnerInvitation1Payload, teamOwnerInvitation2Payload].map(teamOwnerInvitation => ({
      id: teamOwnerInvitation.id,
      email: teamOwnerInvitation.email,
      creditAmount: teamOwnerInvitation.credit_amount,
      creditExpirationInDays: teamOwnerInvitation.credit_expiration_in_days,
      team: teamOwnerInvitation.team
    })))
  })
})

describe('migrate', () => {
  const params = { teamId: 1, feature: 'FOO' }

  it('calls correct api endpoint', async () => {
    await store.dispatch('admin/migrateTeam', params)
    expect(api.post).toHaveBeenCalledWith('admin/teams/1/migrate', { feature: 'FOO' })
  })
})

describe('createCredit', () => {
  let actionParams: StoreActionPayload<typeof createCredit>
  let creditPayload: ReturnType<typeof buildAnnotationCreditPayload>

  beforeEach(() => {
    actionParams = {
      amountBilled: 3600,
      note: 'Custom note',
      team: team1Payload,
      expiresAt: '2030-01-01T00:00:00'
    }

    creditPayload = buildAnnotationCreditPayload({
      team_id: billingV3TeamPayload.id,
      amount_billed: 3600,
      amount_used: 0,
      note: 'Custom note',
      expires_at: '2030-01-01T00:00:00'
    })

    store.commit('admin/SET_TEAMS', [team1Payload, team2Payload, billingV3TeamPayload])
  })

  it('calls correct api endpoint', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: creditPayload }))

    await store.dispatch('admin/createCredit', actionParams)
    expect(api.post).toHaveBeenCalledWith('admin/teams/1/annotation_credits', {
      amount_billed: 3600, note: 'Custom note', expires_at: '2030-01-01T00:00:00'
    })
  })

  it('returns raw data from backend', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: creditPayload }))

    const { data } = await store.dispatch('admin/createCredit', actionParams)

    expect(data).toEqual(creditPayload)
  })

  it('commits credit to store', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: creditPayload }))
    await store.dispatch('admin/createCredit', actionParams)
    expect(store.state.admin.annotationCredits).toEqual([creditPayload])
  })

  it('updates v3 team credits', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({
      data: { ...creditPayload, team_id: billingV3TeamPayload.id }
    }))
    actionParams.team = billingV3TeamPayload
    await store.dispatch('admin/createCredit', actionParams)
    const team = store.state.admin.teams.find(t => t.id === billingV3TeamPayload.id)
    expect(team).toBeDefined()
    expect(team!.customer_v3!.customer_subscription.annotation_credits_bonus).toEqual(21)
  })

  it('returns error with parsed message', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('admin/createCredit', actionParams)

    expect(response).toEqual({
      error: expect.objectContaining({
        message: errorsByCode.ADMIN_ANNOTATION_CREDIT_CREATE,
        status: 401
      })
    })
  })
})

describe('PUSH_TEAM', () => {
  it('pushes team to store', () => {
    expect(store.state.admin.teams).toEqual([])
    store.commit('admin/PUSH_TEAM', team1Payload)
    expect(store.state.admin.teams).toEqual([team1Payload])
  })

  it('replaces team in store', () => {
    store.commit('admin/PUSH_TEAM', team1Payload)
    store.commit('admin/PUSH_TEAM', team1Payload)
    expect(store.state.admin.teams).toEqual([team1Payload])
  })
})

describe('PUSH_ANNOTATION_CREDIT', () => {
  let creditPayload: ReturnType<typeof buildAnnotationCreditPayload>
  beforeEach(() => {
    creditPayload = buildAnnotationCreditPayload({
      team_id: team1Payload.id,
      amount_billed: 3600,
      amount_used: 0
    })
  })

  it('pushes credit to store', () => {
    expect(store.state.admin.annotationCredits).toEqual([])
    store.commit('admin/PUSH_ANNOTATION_CREDIT', creditPayload)
    expect(store.state.admin.annotationCredits).toEqual([creditPayload])
  })

  it('replaces credit in store', () => {
    store.commit('admin/PUSH_ANNOTATION_CREDIT', creditPayload)
    store.commit('admin/PUSH_ANNOTATION_CREDIT', creditPayload)
    expect(store.state.admin.annotationCredits).toEqual([creditPayload])
  })

  it('updates team billed amount if team matched in store', () => {
    store.commit('admin/SET_TEAMS', [billingV3TeamPayload])
    creditPayload.team_id = billingV3TeamPayload.id
    store.commit('admin/PUSH_ANNOTATION_CREDIT', creditPayload)
    expect(store.state.admin.teams[0].customer_v3!.customer_subscription.annotation_credits_bonus).toEqual(21)
  })
})
