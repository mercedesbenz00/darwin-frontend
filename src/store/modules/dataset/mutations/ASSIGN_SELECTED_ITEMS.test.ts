import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildV2DARCWorkflow,
  buildV2WorkflowItemPayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const MUTATION = 'dataset/ASSIGN_SELECTED_ITEMS'

let items: DatasetItemPayload[]

beforeEach(() => {
  items = [
    // a basic item with no workflow
    buildDatasetItemPayload({ id: 555, current_workflow: null }),
    // an item with a 1.0 workflow
    initializeARWorkflow(),
    // an item with a 2.0 workflow
    buildDatasetItemPayload({
      id: 99,
      workflow_item: buildV2WorkflowItemPayload({
        current_stage_instances: [buildV2WorkflowStageInstancePayload({})],
        workflow: buildV2DARCWorkflow()
      })
    })
  ]
  store = createTestStore()
  store.commit('dataset/PUSH_DATASET_ITEMS', items)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })
})

it('assigns assignable selected items', () => {
  store.commit(MUTATION, 5)
  expect(store.state.dataset.datasetItems[0].current_workflow).toBeNull()
  expect(store.state.dataset.datasetItems[0].workflow_item).toBeUndefined()

  expect(store.state.dataset.datasetItems[1].current_workflow!.stages[1][0].assignee_id).toEqual(5)
  expect(
    store.state.dataset.datasetItems[2].workflow_item!.current_stage_instances[0].user_id
  ).toEqual(5)
})

it('only assigns selected items', () => {
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [items[1]], selected: false })
  store.commit(MUTATION, 5)

  expect(store.state.dataset.datasetItems[0].current_workflow).toBeNull()
  expect(store.state.dataset.datasetItems[0].workflow_item).toBeUndefined()

  expect(store.state.dataset.datasetItems[1].current_workflow!.stages[1][0].assignee_id).toBeNull()
  expect(
    store.state.dataset.datasetItems[2].workflow_item!.current_stage_instances[0].user_id
  ).toEqual(5)
})
