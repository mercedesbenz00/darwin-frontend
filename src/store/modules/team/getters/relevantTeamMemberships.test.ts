import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import { MembershipPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const clientTeam = buildTeamPayload({
  id: 4,
  name: 'Client 1',
  managed_status: 'client',
  partner_id: 3
})

const partnerTeam = buildTeamPayload({
  id: 3,
  name: 'Partner',
  managed_status: 'partner',
  clients: [clientTeam]
})

const joeInClient = buildMembershipPayload({ id: 1, team_id: clientTeam.id, user_id: 1 })
const joeInPartner = buildMembershipPayload({ id: 2, team_id: partnerTeam.id, user_id: 1 })
const mikeInClient = buildMembershipPayload({ id: 3, team_id: clientTeam.id, user_id: 2 })
const samInPartner = buildMembershipPayload({ id: 4, team_id: partnerTeam.id, user_id: 3 })

const getter = (store: ReturnType<typeof createTestStore>): MembershipPayload[] =>
  store.getters['team/relevantTeamMemberships']

describe('on client team', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', clientTeam)
  })

  it('returns deduplicated list of users, where partner members are prioritized', () => {
    store.commit('team/SET_MEMBERSHIPS', [joeInClient, joeInPartner, mikeInClient, samInPartner])
    const result = getter(store)
    expect(result.length).toBe(3)
    expect(result).toContain(joeInClient)
    expect(result).toContain(mikeInClient)
    expect(result).toContain(samInPartner)
  })
})

describe('on partner team', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', partnerTeam)
  })

  it('returns deduplicated list of users, where partner members are prioritized', () => {
    store.commit('team/SET_MEMBERSHIPS', [joeInClient, joeInPartner, mikeInClient, samInPartner])
    const result = getter(store)
    expect(result.length).toBe(2)
    expect(result).toContain(joeInPartner)
    expect(result).toContain(samInPartner)
  })
})
