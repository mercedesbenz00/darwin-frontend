import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildApiKeyPayload, buildTeamPayload } from 'test/unit/factories'

import KeyTeamAvatar from '@/components/ApiKey/KeyTeamAvatar.vue'
import team, { getInitialState as getInitialTeamState } from '@/store/modules/team'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', () => {})

const key = buildApiKeyPayload({
  id: 1,
  user_id: 1,
  team_id: 1,
  name: 'Some Key',
  permissions: []
})

const v7 = buildTeamPayload({ id: 1, name: 'V7' })

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      team: { ...team, state: getInitialTeamState() }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

it('matches snapshot when member info not available', () => {
  const propsData = { apiKey: key }
  const store = newStore()
  const wrapper = shallowMount(KeyTeamAvatar, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches shapshot when member info available', () => {
  const propsData = { apiKey: key }
  const store = newStore()
  store.commit('team/PUSH_TEAM', v7)
  const wrapper = shallowMount(KeyTeamAvatar, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
