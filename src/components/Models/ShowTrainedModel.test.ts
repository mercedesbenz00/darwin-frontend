import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTrainedModelPayload, buildTrainingSessionPayload } from 'test/unit/factories'

import ShowTrainedModel from '@/components/Models/ShowTrainedModel.vue'
import { TrainedModelPayload, TrainingSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', () => {})

let store: ReturnType<typeof createTestStore>
let propsData: {
  trainedModel: TrainedModelPayload
} | {
  trainedModel: TrainedModelPayload
  trainingSession: TrainingSessionPayload
}

describe('without training session', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainedModel: buildTrainedModelPayload({ id: '123', name: 'Object Detection Model' })
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowTrainedModel, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('with training session', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainedModel: buildTrainedModelPayload({ id: '123', name: 'Object Detection Model' }),
      trainingSession: buildTrainingSessionPayload({ id: '123', trained_model_id: '123' })
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowTrainedModel, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})
