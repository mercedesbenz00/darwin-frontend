import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildParsedError,
  buildStageAnnotationPayload,
  buildV2DARCWorkflow,
  buildV2WorkflowItemPayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'

import { createV2Annotation } from '@/store/modules/workview/actions/createV2Annotation'
import {
  DatasetItemPayload,
  DatasetPayload,
  V2WorkflowItemPayload,
  StoreActionPayload,
  V2WorkflowPayload,
  V2WorkflowStageInstancePayload
} from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({
  sendV2Commands: jest.fn()
}))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

let payload: StoreActionPayload<typeof createV2Annotation>
let workflow: V2WorkflowPayload
let instance: V2WorkflowStageInstancePayload
let dataset: DatasetPayload
let datasetItem: DatasetItemPayload
let workflowItem: V2WorkflowItemPayload

beforeEach(() => {
  payload = buildStageAnnotationPayload({ id: 'id' })
  store = createUnstubbedTestStore()

  workflow = buildV2DARCWorkflow()
  instance = buildV2WorkflowStageInstancePayload({ stage: workflow.stages[0] })
  dataset = buildDatasetPayload({ id: 1, slug: 'sfh', team_slug: 'v7' })
  datasetItem = buildDatasetItemPayload({ id: 1 })
  workflowItem = buildV2WorkflowItemPayload({
    workflow,
    current_stage_instances: [instance],
    dataset_item_id: 1
  })

  store.commit('workview/SET_DATASET', dataset)
  store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', 'fake-item-id')
  store.commit('workview/SET_V2_WORKFLOWS', [workflow])
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)

  jest
    .spyOn(backend, 'sendV2Commands')
    .mockResolvedValue(buildAxiosResponse({ data: { success: true } }))
})

it('calls the right backend function', async () => {
  await store.dispatch('workview/createV2Annotation', payload)
  const expected: Parameters<typeof backend.sendV2Commands>[0] = {
    commands: [
      {
        type: 'create_annotation',
        data: {
          annotation_id: payload.id,
          annotation_group_id: null,
          annotation_class_id: payload.annotation_class_id,
          data: payload.data,
          z_index: payload.z_index,
          stage_id: instance.stage_id,
          metadata: {}
        }
      }
    ],
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }
  expect(backend.sendV2Commands).toHaveBeenCalledWith(expected)
})

it('returns an object containing annotations on success', async () => {
  const result = await store.dispatch('workview/createV2Annotation', payload)
  expect(result).toStrictEqual({ data: payload })
})

it('pushes the annotation to the store', async () => {
  await store.dispatch('workview/createV2Annotation', payload)
  expect(store.state.workview.stageAnnotations).toStrictEqual([payload])
})

it('reverts added annotation in store on failure', async () => {
  jest
    .spyOn(backend, 'sendV2Commands')
    .mockResolvedValue(buildParsedError({ message: 'backend error' }))

  await store.dispatch('workview/createV2Annotation', payload)
  expect(store.state.workview.stageAnnotations).toStrictEqual([])
})

it('sets the error in the store on failure', async () => {
  const error = buildParsedError({ message: 'backend error' })
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue(error)

  await store.dispatch('workview/createV2Annotation', payload)
  expect(store.state.workview.error).toStrictEqual(error.error)
})

it('returns the error on failure', async () => {
  const error = buildParsedError({ message: 'backend error' })
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue(error)

  const response = await store.dispatch('workview/createV2Annotation', payload)
  expect(response).toStrictEqual(error)
})

it('throws if missing `annotation_class_id`', () => {
  const invalidPayload = { ...payload, annotation_class_id: null }
  expect(store.dispatch('workview/createV2Annotation', invalidPayload)).rejects.toThrow()
})

it('throws if missing `data`', () => {
  const invalidPayload = { ...payload, data: null }
  expect(store.dispatch('workview/createV2Annotation', invalidPayload)).rejects.toThrow()
})

it('throws if no v2SelectedStageInstance', () => {
  // Pre-initialize the Workflow so it doesn't auto-start
  // and assign the selected stage instance from there
  datasetItem = buildDatasetItemPayload({ id: 1, workflow_item: workflowItem })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)

  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', null)
  expect(store.dispatch('workview/createV2Annotation', payload)).rejects.toThrow()
})

it('throws if no stage', () => {
  // Pre-initialize the Workflow so it doesn't auto-start
  // and assign the selected stage instance from there
  datasetItem = buildDatasetItemPayload({ id: 1, workflow_item: workflowItem })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)

  // Explicitly set the stage instance again because SET_SELECTED_DATASET_ITEM clears it
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', { ...instance, stage: null })

  store.commit('workview/SET_V2_SELECTED_STAGE', null)
  expect(store.dispatch('workview/createV2Annotation', payload)).rejects.toThrow()
})
