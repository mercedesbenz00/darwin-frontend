import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import DatasetChannelSubscriber from '@/components/WorkView/Renderless/DatasetChannelSubscriber'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const sfh = buildDatasetPayload({ id: 55 })
const birds = buildDatasetPayload({ id: 66 })

beforeEach(() => {
  store = createTestStore()
  store.commit('auth/SET_AUTHENTICATED', true)
  store.commit('workview/SET_DATASET', sfh)
})

it('joins channel mount', () => {
  shallowMount(DatasetChannelSubscriber, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledWith('workview/joinChannel', { topic: 'dataset:55' })
})

it('never joins channel mount when not authenticated', () => {
  store.commit('auth/SET_AUTHENTICATED', false)
  shallowMount(DatasetChannelSubscriber, { localVue, store })
  expect(store.dispatch).not.toHaveBeenCalledWith('dataset/joinChannel', { topic: 'dataset:55' })
})

it('leaves old, joins new channel on dataset change', async () => {
  shallowMount(DatasetChannelSubscriber, { localVue, store })
  await flushPromises()

  store.commit('workview/SET_DATASET', birds)
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('workview/leaveChannel', { topic: 'dataset:55' })
  expect(store.dispatch).toHaveBeenCalledWith('workview/joinChannel', { topic: 'dataset:66' })
})

it('leaves channel on destroy', async () => {
  const wrapper = shallowMount(DatasetChannelSubscriber, { localVue, store })
  await flushPromises()
  await wrapper.vm.$destroy()
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('workview/leaveChannel', { topic: 'dataset:55' })
})
