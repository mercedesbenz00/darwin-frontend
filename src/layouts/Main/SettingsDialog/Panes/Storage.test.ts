import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import loadingDirective from '@/directives/loading'
import Storage from '@/layouts/Main/SettingsDialog/Panes/Storage.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', loadingDirective)

const stubs: Stubs = { 'secondary-button': true }

const model = {
  storageCreation: 'storage-creation-stub',
  storageList: 'storages-list-stub',
  documentationButton: '.header__button-container secondary-button-stub'
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

afterEach(() => {
  jest.resetAllMocks()
})

it('matches snapshot', async () => {
  const wrapper = shallowMount(Storage, { localVue, store, stubs })
  await flushPromises()

  expect(wrapper.find(model.storageCreation).exists).toBeTruthy()
  expect(wrapper.find(model.storageList).exists).toBeTruthy()

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loading', () => {
  const wrapper = shallowMount(Storage, { localVue, store, stubs })

  expect(wrapper).toMatchSnapshot()
})

it('should trigger storage/getStorages on creation', () => {
  jest.spyOn(store, 'dispatch')

  shallowMount(Storage, { localVue, store, stubs })

  expect(store.dispatch).toBeCalledWith('storage/getStorages')
})

it('should trigger storage/getStorages on team change', async () => {
  shallowMount(Storage, { localVue, store, stubs })
  await flushPromises()

  jest.spyOn(store, 'dispatch')

  const anotherTeam = buildTeamPayload({ id: 56 })
  store.commit('team/SET_CURRENT_TEAM', anotherTeam)

  expect(store.dispatch).toBeCalledWith('storage/getStorages')
})

it('should open storage documentation page', async () => {
  window.open = jest.fn()
  const wrapper = shallowMount(Storage, { localVue, store, stubs })
  await wrapper.find(model.documentationButton).vm.$emit('click')

  expect(window.open).toHaveBeenCalledWith('https://docs.v7labs.com/docs/external-storage-configuration')
})
