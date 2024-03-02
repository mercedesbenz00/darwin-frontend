import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { buildAdminTeamPayload } from 'test/unit/factories'

import admin, { getInitialState as getInitialAdminState } from '@/store/modules/admin'
import ShowView from '@/views/admin/teams/ShowView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      admin: { ...admin, state: getInitialAdminState() }
    }
  })

  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  return store
}

it('matches snapshot while loading team', () => {
  const $route = { params: { teamId: '5' } }
  const mocks = { $route }
  const store = newStore()
  const wrapper = shallowMount(ShowView, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with team loaded', () => {
  const $route = { params: { teamId: '5' } }
  const mocks = { $route }
  const store = newStore()
  const team = buildAdminTeamPayload({ id: 5 })
  store.commit('admin/SET_TEAMS', [team])
  const wrapper = shallowMount(ShowView, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

it('fetches team by route name', () => {
  const $route = { params: { teamId: '5' } }
  const mocks = { $route }
  const store = newStore()
  shallowMount(ShowView, { localVue, mocks, store })
  expect(store.dispatch).toHaveBeenCalledWith('admin/getTeam', '5')
})

it('dispatches toast if team fails to load', async () => {
  const $route = { params: { teamId: '5' } }
  const mocks = { $route }
  const store = newStore()
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake message' } })
  shallowMount(ShowView, { localVue, mocks, store })
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake message' })
})
