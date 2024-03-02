import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildModelTemplatePayload,
  buildRunningSessionPayload,
  buildTrainedModelPayload
} from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers/itemManager'
import { ModelType } from '@/store/types'

import { isPreselectedModelAutoAnnotate } from '.'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
})

describe('isPreselectedModelAutoAnnotate', () => {
  it('returns false if no models have been preselected yet', () => {
    expect(isPreselectedModelAutoAnnotate(editor)).toBeFalsy()
  })

  it('returns false if the preselected model is not found in neuralModel store', () => {
    store.state.workview.preselectedModelId = 'model-id'
    expect(isPreselectedModelAutoAnnotate(editor)).toBeFalsy()
  })

  it('returns false if a non-auto-annotate preselected model is found in store', () => {
    const trainedModel = buildTrainedModelPayload()
    store.state.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateModel = buildRunningSessionPayload({
      trained_model_id: trainedModel.id
    })
    store.state.workview.autoAnnotateModels = [autoAnnotateModel]
    store.state.workview.preselectedModelId = autoAnnotateModel.id

    expect(isPreselectedModelAutoAnnotate(editor)).toBeFalsy()
  })

  it('returns true otherwise', () => {
    const trainedModel = buildTrainedModelPayload({
      model_template: buildModelTemplatePayload({
        type: ModelType.AutoAnnotation
      })
    })
    store.state.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateModel = buildRunningSessionPayload({
      trained_model_id: trainedModel.id
    })
    store.state.workview.autoAnnotateModels = [autoAnnotateModel]
    store.state.workview.preselectedModelId = autoAnnotateModel.id

    expect(isPreselectedModelAutoAnnotate(editor)).toBeTruthy()
  })
})
