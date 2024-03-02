import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTrainedModelPayload } from 'test/unit/factories'

import ModelMetrics from '@/components/Models/ModelMetrics.vue'
import { TrainedModelPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', () => {})

let store: ReturnType<typeof createTestStore>
let propsData: {
  trainedModel: TrainedModelPayload | null
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ModelMetrics, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when trained model is null', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = { trainedModel: null }
  })

  itMatchesSnapshot()
})

describe('when trained model has no training result', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainedModel: buildTrainedModelPayload({
        id: '123',
        name: 'Object Detection Model',
        training_result: undefined
      })
    }
  })

  itMatchesSnapshot()
})

describe('when trained model encodes training result', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainedModel: buildTrainedModelPayload({
        id: '123',
        name: 'Object Detection Model',
        training_result: { segm: { AP: 12 } }
      })
    }
  })

  itMatchesSnapshot()
})
