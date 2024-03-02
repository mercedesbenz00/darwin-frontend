import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import MainView from '@/views/models/MainView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = ['router-link', 'router-view']

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot when loading', async () => {
  const wrapper = shallowMount(MainView, { localVue, store, stubs })
  await wrapper.setData({ loading: true })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loaded', async () => {
  const wrapper = shallowMount(MainView, { localVue, store, stubs })
  await wrapper.setData({ loading: false })
  expect(wrapper).toMatchSnapshot()
})

it('loads data', async () => {
  const wrapper = shallowMount(MainView, { localVue, store, stubs })
  expect(wrapper.vm.$data.loading).toBe(true)
  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/loadTrainingSessions')
  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/loadTrainedModels')
  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/loadRunningSessions')
  await flushPromises()
  expect(wrapper.vm.$data.loading).toBe(false)
})
