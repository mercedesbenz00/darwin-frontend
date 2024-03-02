import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetDetailPayload } from 'test/unit/factories'

import DatasetChannelSubscriber from '@/components/DatasetManagement/Renderless/DatasetChannelSubscriber'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const sfhDetails = buildDatasetDetailPayload({ id: 55 })
const birdsDetails = buildDatasetDetailPayload({ id: 66 })

beforeEach(() => {
  store = createTestStore()
  store.commit('auth/SET_AUTHENTICATED', true)
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', sfhDetails)
})

it('joins channel mount', () => {
  shallowMount(DatasetChannelSubscriber, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/joinChannel', { topic: 'dataset:55' })
})

it('never joins channel mount when not authenticated', () => {
  store.commit('auth/SET_AUTHENTICATED', false)
  shallowMount(DatasetChannelSubscriber, { localVue, store })
  expect(store.dispatch).not.toHaveBeenCalledWith('dataset/joinChannel', { topic: 'dataset:55' })
})

it('leaves old, joins new channel on dataset change', async () => {
  shallowMount(DatasetChannelSubscriber, { localVue, store })
  await flushPromises()

  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', birdsDetails)
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('dataset/leaveChannel', { topic: 'dataset:55' })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/joinChannel', { topic: 'dataset:66' })
})

it('leaves channel on destroy', async () => {
  const wrapper = shallowMount(DatasetChannelSubscriber, { localVue, store })
  await flushPromises()
  await wrapper.vm.$destroy()
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('dataset/leaveChannel', { topic: 'dataset:55' })
})
