import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildClientTeamInvitationPayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'team/PUSH_CLIENT_TEAM_INVITATION'

it('pushes invitation to store', () => {
  const invite = buildClientTeamInvitationPayload({ id: 1 })
  store.commit(MUTATION, invite)

  const invite2 = buildClientTeamInvitationPayload({ id: 2 })
  store.commit(MUTATION, invite2)

  expect(store.state.team.clientTeamInvitations).toEqual([invite, invite2])
})

it('replaces invitation in store', () => {
  const invite = buildClientTeamInvitationPayload({ id: 1 })

  store.commit(MUTATION, invite)
  store.commit(MUTATION, invite)

  expect(store.state.team.clientTeamInvitations).toEqual([invite])
})
