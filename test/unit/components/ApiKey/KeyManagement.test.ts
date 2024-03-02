import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import { buildUserPayload, buildApiKeyPayload, buildTeamPayload } from 'test/unit/factories'

import KeyManagement from '@/components/ApiKey/KeyManagement.vue'
import { installCommonComponents } from '@/plugins/components'
import apiKey, { getInitialState as getInitialApiKeyState } from '@/store/modules/apiKey'
import team, { getInitialState as getInitialTeamState } from '@/store/modules/team'
import user, { getInitialState as getInitialUserState } from '@/store/modules/user'

const localVue = createLocalVue()
localVue.use(VueJSModal)
localVue.use(Vuex)
installCommonComponents(localVue)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      apiKey: { ...apiKey, state: getInitialApiKeyState() },
      user: { ...user, state: getInitialUserState() },
      team: { ...team, state: getInitialTeamState() }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

const joe = buildUserPayload({ id: 1, first_name: 'Joe', last_name: 'Real' })

const key1 = buildApiKeyPayload({
  id: 1,
  team_id: 1,
  user_id: 1,
  prefix: 'abcdef',
  name: 'Generic',
  permissions: [['view_datasets', 'all']]
})

const key2 = buildApiKeyPayload({
  id: 2,
  team_id: 1,
  user_id: 1,
  prefix: 'abcdef',
  name: 'Specific',
  permissions: [['assign_items', 'dataset:1']]
})

const key3 = buildApiKeyPayload({
  id: 3,
  team_id: 1,
  user_id: 2,
  prefix: 'abcdef',
  name: 'Specific',
  permissions: [['assign_items', 'dataset:1']]
})

const v7 = buildTeamPayload({ id: 1, name: 'v7' })

it('matches snapshot', () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_CURRENT_TEAM', v7)
  const wrapper = shallowMount(KeyManagement, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('loads keys on mount', () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_CURRENT_TEAM', v7)
  shallowMount(KeyManagement, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledWith('apiKey/getKeys')
})

it('matches snapshot with user and team keys present', () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_CURRENT_TEAM', v7)
  // key3 is by another member in the team. should be in a separate section on the snapshot
  store.commit('apiKey/SET_API_KEYS', [key1, key2, key3])

  // shallowMount only shows default slot given, so we need a custom stub to show icon slot
  const KeyListItem = {
    template: `
      <div class="key-list-item">
        <slot name="icon" />
        <slot />
      </div>
    `
  }

  const stubs: Stubs = { KeyListItem }
  const wrapper = shallowMount(KeyManagement, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('loads correct number of snippets', () => {
  const store = newStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  const wrapper = shallowMount(KeyManagement, { localVue, store })
  expect(wrapper.vm.$data.snippets.length).toEqual(2)
})
