import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildApiKeyPayload, buildMembershipPayload } from 'test/unit/factories'

import KeyOwnerAvatar from '@/components/ApiKey/KeyOwnerAvatar.vue'
import team, { getInitialState as getInitialTeamState } from '@/store/modules/team'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', () => {})

const key = buildApiKeyPayload({
  id: 1,
  user_id: 1,
  team_id: 1,
  name: 'Some Key',
  prefix: 'abcdefg',
  permissions: [['view_models', 'all'], ['run_inference', 'model:1']]
})

const membership = buildMembershipPayload({
  id: 1, user_id: 1, team_id: 1, first_name: 'Joe', last_name: 'Labs'
})

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
  const wrapper = shallowMount(KeyOwnerAvatar, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches shapshot when member info available', () => {
  const propsData = { apiKey: key }
  const store = newStore()
  store.commit('team/SET_MEMBERSHIPS', [membership])
  const wrapper = shallowMount(KeyOwnerAvatar, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
