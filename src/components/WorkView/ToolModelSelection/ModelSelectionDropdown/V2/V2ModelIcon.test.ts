import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { ModelType } from '@/store/types'

import V2ModelIcon from './V2ModelIcon.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: { modelType: ModelType }

const itMatchesSnapshot = (modelType: ModelType) => {
  propsData = { modelType }
  const wrapper = shallowMount(V2ModelIcon, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
}

describe('for AutoAnnotation', () => {
  it('matches snapshot', () => {
    itMatchesSnapshot(ModelType.AutoAnnotation)
  })
})

describe('for InstanceSegmentation', () => {
  it('matches snapshot', () => {
    itMatchesSnapshot(ModelType.InstanceSegmentation)
  })
})

describe('for ObjectDetection', () => {
  it('matches snapshot', () => {
    itMatchesSnapshot(ModelType.ObjectDetection)
  })
})

describe('for Classification', () => {
  it('matches snapshot', () => {
    itMatchesSnapshot(ModelType.Classification)
  })
})
