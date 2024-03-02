import { shallowMount } from '@vue/test-utils'

import { buildTrainedModelPayload } from 'test/unit/factories'

import ModelStats from '@/components/Models/ModelStats/ModelStats.vue'
import { TrainedModelPayload } from '@/store/types'

let propsData: {
  trainedModel: TrainedModelPayload | null
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ModelStats, { propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when trainedModel is null', () => {
  beforeEach(() => {
    propsData = { trainedModel: null }
  })

  itMatchesSnapshot()
})

describe('when trainedModel is defined', () => {
  beforeEach(() => {
    propsData = {
      trainedModel: buildTrainedModelPayload({
        training_result: {
          segm: {
            AP: 50,
            AP50: 75,
            AP75: 60
          }
        }
      })
    }
  })

  itMatchesSnapshot()
})
