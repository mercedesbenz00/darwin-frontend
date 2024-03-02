import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildV2WorkflowItemPayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const item = buildV2WorkflowItemPayload({ dataset_item_id: 10 })
const datasetItem = buildDatasetItemPayload({ id: 10, workflow_item: null })

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)
})

const MUTATION = 'workview/PUSH_V2_WORKFLOW_ITEM'

it('pushes new item', () => {
  store.commit(MUTATION, item)
  expect(store.state.workview.selectedDatasetItem?.workflow_item).toEqual(item)
})

it('replaces existing item', () => {
  store.commit(MUTATION, item)
  const otherItem = { ...item, id: 'other_id' }
  store.commit(MUTATION, otherItem)
  expect(store.state.workview.selectedDatasetItem?.workflow_item).toEqual(otherItem)
})

it('does nothing if no selected dataset item', () => {
  store.commit('workview/SET_SELECTED_DATASET_ITEM', null)
  store.commit(MUTATION, item)
  expect(store.state.workview.selectedDatasetItem).toBeNull()
})

it('does nothing if id mismatch', () => {
  store.commit(MUTATION, { ...item, dataset_item_id: -1 })
  expect(store.state.workview.selectedDatasetItem?.workflow_item).toBeNull()
})
