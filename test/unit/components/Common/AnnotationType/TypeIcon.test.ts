import { createLocalVue, shallowMount } from '@vue/test-utils'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'

const localVue = createLocalVue()

let propsData: {
  type: string
  color: string
}

beforeEach(() => {
  propsData = {
    color: 'FF0000',
    type: 'polygon'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TypeIcon, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
