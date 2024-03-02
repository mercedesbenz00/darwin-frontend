import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildClientTeamInvitationPayload, buildTeamPayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const GETTER = 'team/currentTeamClientInvitations'

const team1 = buildTeamPayload({ id: 1 })
const invite11 = buildClientTeamInvitationPayload({ id: 1, partner_team_id: 1 })
const invite12 = buildClientTeamInvitationPayload({ id: 2, partner_team_id: 1 })

const team2 = buildTeamPayload({ id: 2 })
const invite2 = buildClientTeamInvitationPayload({ id: 3, partner_team_id: 2 })

beforeEach(() => {
  store = createTestStore()
  store.commit('team/PUSH_CLIENT_TEAM_INVITATION', invite11)
  store.commit('team/PUSH_CLIENT_TEAM_INVITATION', invite12)
  store.commit('team/PUSH_CLIENT_TEAM_INVITATION', invite2)
})

it('returns [] if no current team', () => {
  expect(store.getters[GETTER]).toEqual([])
})

it('returns invitations associated to current team by partner id', () => {
  store.commit('team/SET_CURRENT_TEAM', team1)
  expect(store.getters[GETTER]).toEqual([invite11, invite12])

  store.commit('team/SET_CURRENT_TEAM', team2)
  expect(store.getters[GETTER]).toEqual([invite2])
})
