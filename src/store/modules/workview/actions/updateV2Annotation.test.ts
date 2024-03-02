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

import { updateV2Annotation } from '@/store/modules/workview/actions/updateV2Annotation'
import {
  StoreActionPayload,
  V2WorkflowPayload,
  V2WorkflowStageInstancePayload
} from '@/store/types'
import * as backend from '@/utils/backend'
import { ErrorCodes } from '@/utils/error/errors'

jest.mock('@/utils/backend', () => ({ sendV2Commands: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

let annotation: StoreActionPayload<typeof updateV2Annotation>
let annotation2: StoreActionPayload<typeof updateV2Annotation>
let workflow: V2WorkflowPayload
let instance: V2WorkflowStageInstancePayload

beforeEach(() => {
  jest
    .spyOn(backend, 'sendV2Commands')
    .mockResolvedValue(buildAxiosResponse({ data: { success: true } }))

  annotation = buildStageAnnotation({ id: 'id', isVisible: true })
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
  await store.dispatch('workview/updateV2Annotation', annotation)
  const expected: Parameters<typeof backend.sendV2Commands>[0] = {
    commands: [{
      type: 'update_annotation',
      data: {
        annotation_class_id: annotation.annotation_class_id,
        annotation_id: annotation.id,
        data: annotation.data,
        stage_id: instance.stage_id,
        z_index: annotation.z_index,
        metadata: {}
      }
    }],
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }
  expect(backend.sendV2Commands).toHaveBeenCalledWith(expected)
})

it('returns the command response on success', async () => {
  const result = await store.dispatch('workview/updateV2Annotation', annotation)
  expect(result).toStrictEqual(buildAxiosResponse({ data: { success: true } }))
})

it('updates the correct annotation in the store', async () => {
  await store.dispatch('workview/updateV2Annotation', { ...annotation, isVisible: false })
  const expected = [
    expect.objectContaining({ isVisible: true }),
    expect.objectContaining({ isVisible: false })
  ]
  expect(store.state.workview.stageAnnotations).toStrictEqual(expected)
})

it('reverts updated annotation in store on failure', async () => {
  jest
    .spyOn(backend, 'sendV2Commands')
    .mockResolvedValue(buildParsedError({ message: 'backend error' }))

  await store.dispatch('workview/updateV2Annotation', { ...annotation, isVisible: false })
  expect(store.state.workview.stageAnnotations).toStrictEqual([annotation, annotation2])
})

it('sets the error in the store on failure', async () => {
  const error = buildParsedError({ message: 'backend error' })
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue(error)

  await store.dispatch('workview/updateV2Annotation', annotation)
  expect(store.state.workview.error).toStrictEqual(error.error)
})

it('returns `UPDATING_ANNOTATION_WITHOUT_ID` error if missing `id`', () => {
  const invalidPayload = { ...annotation, id: null }
  const expected = {
    error: expect.objectContaining({ code: ErrorCodes.UPDATING_ANNOTATION_WITHOUT_ID })
  }
  expect(store.dispatch('workview/updateV2Annotation', invalidPayload))
    .resolves
    .toStrictEqual(expected)
})

it('returns the error on failure', async () => {
  const error = buildParsedError({ message: 'backend error' })
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue(error)

  const response = await store.dispatch('workview/updateV2Annotation', annotation)
  expect(response).toStrictEqual(error)
})

it('throws if cannot find the `annotation` in the store', () => {
  const invalidPayload = { ...annotation, id: 'invalid' }
  expect(store.dispatch('workview/updateV2Annotation', invalidPayload)).rejects.toThrow()
})

it('throws if no v2SelectedStageInstance', () => {
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', null)
  expect(store.dispatch('workview/updateV2Annotation', annotation)).rejects.toThrow()
})
