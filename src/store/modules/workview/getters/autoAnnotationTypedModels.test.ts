import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildModelTemplatePayload, buildRunningSessionPayload, buildTrainedModelPayload } from 'test/unit/factories'

import { autoAnnotationTypedModels } from '@/store/modules/workview/getters/autoAnnotationTypedModels'
import { WorkviewState } from '@/store/modules/workview/state'
import { ModelType, RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let state: WorkviewState
const getters = {}
let rootState: RootState
const rootGetters = {}

beforeEach(() => {
  const store = createTestStore()
  state = store.state.workview
  rootState = store.state
})

describe('autoAnnotationTypedModels', () => {
  it('returns empty list if no autoAnnotateModels exist', () => {
    const data = autoAnnotationTypedModels(state, getters, rootState, rootGetters)
    expect(data()).toEqual([])
  })

  it('returns empty list if no models of type auto_annotate exist in store', () => {
    state.autoAnnotateModels = [
      buildRunningSessionPayload()
    ]

    const data = autoAnnotationTypedModels(state, getters, rootState, rootGetters)
    expect(data()).toEqual([])
  })

  it('returns only models of type auto_annoate', () => {
    const trainedModel = buildTrainedModelPayload({
      model_template: buildModelTemplatePayload({
        type: ModelType.AutoAnnotation
      })
    })

    rootState.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateRunningSession = buildRunningSessionPayload({
      trained_model_id: trainedModel.id
    })

    state.autoAnnotateModels = [
      autoAnnotateRunningSession,
      buildRunningSessionPayload()
    ]

    const data = autoAnnotationTypedModels(state, getters, rootState, rootGetters)
    expect(data()).toEqual([autoAnnotateRunningSession])
  })
})
