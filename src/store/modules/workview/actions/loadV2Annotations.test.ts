import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import {
  buildAnnotationTypePayload,
  buildAxiosResponse,
  buildStageAnnotationPayload,
  buildWorkflowStagePayload,
  buildDatasetPayload,
  buildDatasetItemPayload
} from 'test/unit/factories'

import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof initializeStore>

const item = buildDatasetItemPayload()
const stage = buildWorkflowStagePayload({ id: 1 })
const annotation1 = buildStageAnnotationPayload({
  id: 'annotation1',
  workflow_stage_id: stage.id
})
const annotation2 = buildStageAnnotationPayload({
  id: 'annotation2',
  workflow_stage_id: stage.id
})

const annotationTypes = [
  buildAnnotationTypePayload({ id: 1, granularity: 'main' }),
  buildAnnotationTypePayload({ id: 2, granularity: 'sub' })
]

const annotations = [annotation1, annotation2]

const createStore = () => {
  const store = initializeStore()
  const { dispatch } = store
  store.dispatch = jest.fn().mockImplementation((action: string, payload: any) => {
    if (action.startsWith('toast')) {
      return {}
    } else {
      return dispatch(action, payload)
    }
  })

  return store
}

const dataset = buildDatasetPayload()
jest.mock('@/utils/backend', () => ({ loadV2Annotations: jest.fn() }))

beforeEach(() => {
  store = createStore()

  store.commit('aclass/SET_TYPES', annotationTypes)
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_DATASET', dataset)

  jest.spyOn(backend, 'loadV2Annotations')
    .mockResolvedValueOnce(buildAxiosResponse({ data: annotations }))
    .mockResolvedValue(buildAxiosResponse({ data: annotations }))

  jest
    .spyOn(tutorialBackend, 'loadStageAnnotations')
    .mockReturnValue({ data: annotations })
})

it('calls correct API endpoint', async () => {
  await store.dispatch('workview/loadV2Annotations', item.id)
  await flushPromises()

  expect(backend.loadV2Annotations).toHaveBeenCalledWith({
    teamSlug: dataset.team_slug,
    datasetSlug: dataset.slug,
    datasetItemId: item.id,
    annotationGroupIds: [],
  })
})

it('loads proper tutorial data', async () => {
  store.commit('workview/SET_TUTORIAL_MODE', true)
  await store.dispatch('workview/loadV2Annotations', stage.id)
  await flushPromises()

  expect(tutorialBackend.loadStageAnnotations).toHaveBeenCalledWith({ stageId: stage.id })
})

it('sets annotations in the workview', async () => {
  await store.dispatch('workview/loadV2Annotations', item.id)
  await flushPromises()

  expect(store.state.workview.stageAnnotations)
    .toEqual(annotations.map(annotation => expect.objectContaining(annotation)))
})
