import { shallowMount } from '@vue/test-utils'

import { buildTrainedModelPayload } from 'test/unit/factories'

import AccuracyModelStat from '@/components/Models/ModelStats/AccuracyModelStat.vue'
import { TrainedModelPayload } from '@/store/types'

let propsData: {
  trainedModel: TrainedModelPayload | null
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(AccuracyModelStat, { propsData })
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

describe('when accuracy field is undefined', () => {
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

describe('otherwise', () => {
  beforeEach(() => {
    propsData = {
      trainedModel: buildTrainedModelPayload({
        training_result: {
          test_metrics: {
            accuracy: 0.97
          }
        }
      })
    }
  })

  itMatchesSnapshot()
})
