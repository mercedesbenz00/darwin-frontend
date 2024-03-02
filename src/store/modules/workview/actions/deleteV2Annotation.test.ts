import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildDatasetPayload,
  buildParsedError,
  buildStageAnnotation,
  buildV2DARCWorkflow,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'

import { deleteV2Annotation } from '@/store/modules/workview/actions/deleteV2Annotation'
import {
  StoreActionPayload, V2WorkflowPayload, V2WorkflowStageInstancePayload
} from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ sendV2Commands: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

let annotation: StoreActionPayload<typeof deleteV2Annotation>
let annotation2: StoreActionPayload<typeof deleteV2Annotation>
let workflow: V2WorkflowPayload
let instance: V2WorkflowStageInstancePayload

beforeEach(() => {
  jest
    .spyOn(backend, 'sendV2Commands')
    .mockResolvedValue(buildAxiosResponse({ data: { success: true } }))

  annotation = buildStageAnnotation({ id: 'id' })
  annotation2 = buildStageAnnotation({ id: 'id2' })

  store = createUnstubbedTestStore()

  workflow = buildV2DARCWorkflow()
  instance = buildV2WorkflowStageInstancePayload({ stage: workflow.stages[0] })

  store.commit('workview/SET_DATASET', buildDatasetPayload({ id: 5, slug: 'sfh', team_slug: 'v7' }))
  store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', 'fake-item-id')
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
  store.commit('workview/PUSH_STAGE_ANNOTATION', annotation)
  store.commit('workview/PUSH_STAGE_ANNOTATION', annotation2)
})

it('calls the right backend function', async () => {
  await store.dispatch('workview/deleteV2Annotation', annotation)

  const expected: Parameters<typeof backend.sendV2Commands>[0] = {
    commands: [{
      type: 'delete_annotation',
      data: {
        annotation_id: annotation.id,
        stage_id: instance.stage_id
      }
    }],
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }
  expect(backend.sendV2Commands).toHaveBeenCalledWith(expected)
})

it('returns the annotation on success', async () => {
  const result = await store.dispatch('workview/deleteV2Annotation', annotation)
  expect(result).toStrictEqual({ data: annotation })
})

it('deletes the correct annotation from the store', async () => {
  await store.dispatch('workview/deleteV2Annotation', annotation)
  const expected = [expect.objectContaining({ id: 'id2' })]
  expect(store.state.workview.stageAnnotations).toStrictEqual(expected)
})

it('reverts the deleted annotation on failure', async () => {
  jest
    .spyOn(backend, 'sendV2Commands')
    .mockResolvedValue(buildParsedError({ message: 'backend error' }))

  await store.dispatch('workview/deleteV2Annotation', annotation)
  expect(store.state.workview.stageAnnotations).toStrictEqual([annotation2, annotation])
})

it('sets the error in the store on failure', async () => {
  const error = buildParsedError({ message: 'backend error' })
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue(error)

  await store.dispatch('workview/deleteV2Annotation', annotation)
  expect(store.state.workview.error).toStrictEqual(error.error)
})

it('returns the input payload if missing `annotation` from the store', () => {
  const invalidPayload = { ...annotation, id: 'none' }
  expect(store.dispatch('workview/deleteV2Annotation', invalidPayload))
    .resolves
    .toStrictEqual({ data: invalidPayload })
})

it('returns the annotation if missing annotation `id`', () => {
  const invalidPayload = { ...annotation, id: 'id' }
  expect(store.dispatch('workview/deleteV2Annotation', invalidPayload))
    .resolves
    .toStrictEqual({ data: expect.objectContaining({ id: 'id' }) })
})

it('returns the error on failure', async () => {
  const error = buildParsedError({ message: 'backend error' })
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue(error)

  const response = await store.dispatch('workview/deleteV2Annotation', annotation)
  expect(response).toStrictEqual(error)
})

it('throws if no v2SelectedStageInstance', () => {
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', null)
  expect(store.dispatch('workview/deleteV2Annotation', annotation)).rejects.toThrow()
})
