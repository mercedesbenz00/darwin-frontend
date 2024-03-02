import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import ClientPane from '@/components/Plans/Product/ClientPane.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ClientPane, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

beforeEach(() => {
  store = createTestStore()
  const partner = buildTeamPayload({ name: 'Some partner' })
  const client = buildTeamPayload({ id: 1, managed_status: 'client', partner })
  store.commit('team/SET_CURRENT_TEAM', client)
})

itMatchesSnapshot()
