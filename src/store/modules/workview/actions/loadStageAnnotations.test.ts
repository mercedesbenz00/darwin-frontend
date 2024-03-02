import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import {
  buildAnnotationTypePayload,
  buildAxiosResponse,
  buildStageAnnotationPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'

import loadStageAnnotations from '@/store/modules/workview/actions/loadStageAnnotations'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof initializeStore>

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
let params: StoreActionPayload<typeof loadStageAnnotations>

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

beforeEach(() => {
  store = createStore()

  store.commit('aclass/SET_TYPES', annotationTypes)

  jest.spyOn(backend, 'loadStageAnnotations')
    .mockResolvedValueOnce(buildAxiosResponse({ data: annotations }))
    .mockResolvedValue(buildAxiosResponse({ data: annotations }))

  jest
    .spyOn(tutorialBackend, 'loadStageAnnotations')
    .mockReturnValue({ data: annotations })

  params = stage
})

it('calls correct API endpoint', async () => {
  await store.dispatch('workview/loadStageAnnotations', params)
  await flushPromises()

  expect(backend.loadStageAnnotations).toHaveBeenCalledWith({ stageId: stage.id })
})

it('loads proper tutorial data', async () => {
  store.commit('workview/SET_TUTORIAL_MODE', true)
  await store.dispatch('workview/loadStageAnnotations', params)
  await flushPromises()

  expect(tutorialBackend.loadStageAnnotations).toHaveBeenCalledWith({ stageId: stage.id })
})

it('sets annotations in the workview', async () => {
  await store.dispatch('workview/loadStageAnnotations', params)
  await flushPromises()

  expect(store.state.workview.stageAnnotations)
    .toEqual(annotations.map(annotation => expect.objectContaining(annotation)))
})
