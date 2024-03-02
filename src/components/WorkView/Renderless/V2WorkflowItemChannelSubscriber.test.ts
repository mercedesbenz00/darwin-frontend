import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2DatasetItemPayload } from 'test/unit/factories'

import V2WorkflowItemChannelSubscriber from './V2WorkflowItemChannelSubscriber'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const datasetItem1 = buildV2DatasetItemPayload({ id: '1' })
const datasetItem2 = buildV2DatasetItemPayload({ id: '2' })

const mocks = { $featureEnabled: (): boolean => true }

beforeEach(() => {
  store = createTestStore()
  store.commit('dataset/INIT_V2_DATASET_ITEMS', [datasetItem1.id, datasetItem2.id])
  store.commit('dataset/SET_V2_DATASET_ITEMS', [datasetItem1, datasetItem2])
})

const itDoesNothing = (): void => it('does nothing', () => {
  shallowMount(V2WorkflowItemChannelSubscriber, { localVue, mocks, store })
  expect(store.dispatch).not.toHaveBeenCalled()
})

describe('when not authenticated', () => {
  itDoesNothing()
})

describe('when authenticated', () => {
  beforeEach(() => {
    store.commit('auth/SET_AUTHENTICATED', true)
  })

  describe('no items', () => {
    itDoesNothing()

    it('joins on item change', async () => {
      shallowMount(V2WorkflowItemChannelSubscriber, { localVue, mocks, store })
      store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', datasetItem1.id)
      await flushPromises()
      expect(store.dispatch).toHaveBeenCalledWith('workview/joinV2WorkflowsChannel', datasetItem1)
    })
  })

  describe('item already in store', () => {
    beforeEach(() => {
      store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', datasetItem1.id)
    })

    it('dispatches join on mount if item preselected', () => {
      shallowMount(V2WorkflowItemChannelSubscriber, { localVue, mocks, store })
      expect(store.dispatch).toHaveBeenCalledWith('workview/joinV2WorkflowsChannel', datasetItem1)
    })

    it('leaves old channel and joins new on item change', async () => {
      shallowMount(V2WorkflowItemChannelSubscriber, { localVue, mocks, store })
      store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', datasetItem2.id)
      await flushPromises()
      expect(store.dispatch)
        .toHaveBeenNthCalledWith(1, 'workview/joinV2WorkflowsChannel', datasetItem1)
      expect(store.dispatch)
        .toHaveBeenNthCalledWith(2, 'workview/leaveV2WorkflowsChannel', datasetItem1)
      expect(store.dispatch)
        .toHaveBeenNthCalledWith(3, 'workview/joinV2WorkflowsChannel', datasetItem2)
    })
  })
})
