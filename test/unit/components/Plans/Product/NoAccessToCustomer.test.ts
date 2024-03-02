import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import NoAccessToCustomer from '@/components/Plans/Product/NoAccessToCustomer.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const slots = { content: 'content' }

beforeEach(() => { store = createTestStore() })

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(NoAccessToCustomer, { localVue, slots, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when no current team', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', null)
  })

  itMatchesSnapshot()
})

describe('when no owner in the team', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ members: [] }))
  })

  itMatchesSnapshot()
})

describe('when the team has owner', () => {
  const owner = buildMembershipPayload({
    role: 'admin',
    first_name: 'Admin',
    last_name: 'Owner'
  })
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ members: [owner] }))
  })

  itMatchesSnapshot()
})
