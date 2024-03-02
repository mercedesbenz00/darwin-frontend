import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildV2DARCWorkflow,
  buildV2WorkflowItemPayload,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const workflow = buildV2DARCWorkflow()

const instance = buildV2WorkflowStageInstancePayload({
  item_id: 'item',
  id: 'instance',
  data: { skipped: false, active_edge: null, scheduled_to_complete_at: 'foo' }
})
const workflowItem = buildV2WorkflowItemPayload({
  id: 'item',
  current_stage_instances: [instance],
  workflow
})

const workflowItemState = buildV2WorkflowItemStatePayload({
  item_id: 'item',
  current_stage_instances: [instance]
})

const datasetItem1 = buildDatasetItemPayload({ id: 1, workflow_item: workflowItem })
const datasetItem2 = buildDatasetItemPayload({ id: 2 })

const MUTATION = 'workview/CLEAR_V2_AUTOCOMPLETE'
beforeEach(() => {
  store = createTestStore()
})

it('does nothing on blank state', () => {
  expect(() => store.commit(MUTATION, instance)).not.toThrow()
})

it('updates selected stage instance', () => {
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
  store.commit(MUTATION, instance)

  expect(
    store.state.workview.v2SelectedStageInstance?.data.scheduled_to_complete_at
  ).toBe(null)
})

it('updates item state', () => {
  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', workflowItemState)
  store.commit(MUTATION, instance)

  const itemState = store.state.workview.v2WorkflowItemState
  expect(itemState?.current_stage_instances[0].data.scheduled_to_complete_at).toBe(null)
})

it('updates selected dataset item', () => {
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem1)
  store.commit(MUTATION, instance)
  const datasetItem = store.state.workview.selectedDatasetItem
  expect(
    datasetItem?.workflow_item?.current_stage_instances[0].data.scheduled_to_complete_at
  ).toBe(null)
})

it('updates other dataset items', () => {
  store.commit('workview/PUSH_DATASET_ITEMS', [datasetItem1, datasetItem2])
  store.commit(MUTATION, instance)
  const updatedItem1 = store.state.workview.datasetItems[0]
  const updatedItem2 = store.state.workview.datasetItems[1]

  expect(
    updatedItem1?.workflow_item?.current_stage_instances[0].data.scheduled_to_complete_at
  ).toBe(null)

  expect(
    updatedItem2?.workflow_item?.current_stage_instances[0].data.scheduled_to_complete_at
  ).toBeUndefined()
})
