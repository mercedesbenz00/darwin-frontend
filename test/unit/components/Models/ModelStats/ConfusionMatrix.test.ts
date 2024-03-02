import { shallowMount } from '@vue/test-utils'

import { buildTrainedModelPayload } from 'test/unit/factories'

import ConfusionMatrix from '@/components/Models/ModelStats/ConfusionMatrix.vue'
import { TrainedModelPayload } from '@/store/types'

let propsData: {
  trainedModel: TrainedModelPayload | null
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(ConfusionMatrix, { propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when trainedModel is null', () => {
  beforeEach(() => {
    propsData = { trainedModel: null }
  })

  itMatchesSnapshot()
})

describe('when training results are null', () => {
  beforeEach(() => {
    propsData = {
      trainedModel: buildTrainedModelPayload({
        training_result: null
      })
    }
  })

  itMatchesSnapshot()
})

describe('when training results test_metrics field in undefined', () => {
  beforeEach(() => {
    propsData = {
      trainedModel: buildTrainedModelPayload({
        training_result: {}
      })
    }
  })

  itMatchesSnapshot()
})

describe('when norm field is undefined', () => {
  beforeEach(() => {
    propsData = {
      trainedModel: buildTrainedModelPayload({
        training_result: {
          test_metrics: {}
        }
      })
    }
  })

  itMatchesSnapshot()
})

describe('when classes is undefined', () => {
  beforeEach(() => {
    propsData = {
      trainedModel: buildTrainedModelPayload({
        training_result: {
          test_metrics: {
            norm: [
              [0.1, 0.2, 0.3, 0.4],
              [0.5, 0.6, 0.7, 0.8],
              [0.9, 0.8, 0.7, 0.6],
              [0.5, 0.4, 0.3, 0.2]
            ]
          }
        }
      })
    }
  })

  itMatchesSnapshot()
})

describe('otherwise', () => {
  beforeEach(() => {
    propsData = {
      trainedModel: buildTrainedModelPayload({
        training_result: {
          classes: ['a', 'b', 'c', 'd'],
          test_metrics: {
            norm: [
              [0.1, 0.2, 0.3, 0.4],
              [0.5, 0.6, 0.7, 0.8],
              [0.9, 0.8, 0.7, 0.6],
              [0.5, 0.4, 0.3, 0.2]
            ]
          }
        }
      })
    }
  })

  itMatchesSnapshot()
})
