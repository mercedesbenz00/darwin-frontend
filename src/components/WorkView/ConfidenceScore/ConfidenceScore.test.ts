import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { InferenceMetadata } from '@/engineCommon/backend'

import ConfidenceScore from './ConfidenceScore.vue'

const localVue = createLocalVue()
localVue.use(VTooltip)

let propsData: {
  classColor: string,
  inferenceData: InferenceMetadata,
  name: string
}

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ConfidenceScore, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('50% confidence', () => {
  beforeEach(() => {
    propsData = {
      classColor: 'rgba(123, 123, 123, 1.0)',
      inferenceData: {
        confidence: 0.5,
        model: {
          id: 'fake-id',
          name: 'Fake Model',
          type: 'instance_segmentation'
        }
      },
      name: 'Fake Class'
    }
  })

  itMatchesSnapshot()
})

describe('50% confidence', () => {
  beforeEach(() => {
    propsData = {
      classColor: 'rgba(123, 123, 123, 1.0)',
      inferenceData: {
        confidence: 0.75,
        model: {
          id: 'fake-id',
          name: 'Fake Model',
          type: 'instance_segmentation'
        }
      },
      name: 'Fake Class'
    }
  })

  itMatchesSnapshot()
})

describe('100% confidence', () => {
  beforeEach(() => {
    propsData = {
      classColor: 'rgba(123, 123, 123, 1.0)',
      inferenceData: {
        confidence: 1.0,
        model: {
          id: 'fake-id',
          name: 'Fake Model',
          type: 'instance_segmentation'
        }
      },
      name: 'Fake Class'
    }
  })

  itMatchesSnapshot()
})

describe('0% confidence', () => {
  beforeEach(() => {
    propsData = {
      classColor: 'rgba(123, 123, 123, 1.0)',
      inferenceData: {
        confidence: 0,
        model: {
          id: 'fake-id',
          name: 'Fake Model',
          type: 'instance_segmentation'
        }
      },
      name: 'Fake Class'
    }
  })

  itMatchesSnapshot()
})
