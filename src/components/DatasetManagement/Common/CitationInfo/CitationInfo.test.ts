import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildUserPayload, buildDatasetPayload, buildTeamPayload } from 'test/unit/factories'

import CitationInfo from './CitationInfo.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const userProfile = buildUserPayload({
  id: 1, first_name: 'Joe', last_name: 'Smith', image: null
})

beforeEach(() => {
  store = createTestStore()
  store.commit('user/SET_PROFILE', userProfile)
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 1, slug: 'v7' }))
})

it('matches snapshot', () => {
  const propsData = { dataset: buildDatasetPayload({ id: 1 }) }
  const wrapper = shallowMount(CitationInfo, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
