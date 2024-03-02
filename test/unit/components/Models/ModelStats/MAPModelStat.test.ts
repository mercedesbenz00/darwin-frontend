import { shallowMount } from '@vue/test-utils'

import { buildTrainedModelPayload } from 'test/unit/factories'

import MAPModelStat from '@/components/Models/ModelStats/MAPModelStat.vue'
import { TrainedModelPayload } from '@/store/types'

let propsData: {
  iouValue: string | null
  trainedModel: TrainedModelPayload | null
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(MAPModelStat, { propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when trainedModel is null', () => {
  beforeEach(() => {
    propsData = { iouValue: null, trainedModel: null }
  })

  itMatchesSnapshot()
})

describe('when training results are null', () => {
  beforeEach(() => {
    propsData = {
      iouValue: null,
      trainedModel: buildTrainedModelPayload({
        training_result: null
      })
    }
  })

  itMatchesSnapshot()
})

describe('when training results segm field in undefined', () => {
  beforeEach(() => {
    propsData = {
      iouValue: null,
      trainedModel: buildTrainedModelPayload({
        training_result: {}
      })
    }
  })

  itMatchesSnapshot()
})

describe('when iouValue is null, use AP', () => {
  beforeEach(() => {
    propsData = {
      iouValue: null,
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

describe('when iouValue is 50%, use AP50', () => {
  beforeEach(() => {
    propsData = {
      iouValue: '50%',
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

describe('when iouValue is 75%, use AP75', () => {
  beforeEach(() => {
    propsData = {
      iouValue: '75%',
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

describe('when iouValue encodes any other value, use AP', () => {
  beforeEach(() => {
    propsData = {
      iouValue: 'Average',
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
