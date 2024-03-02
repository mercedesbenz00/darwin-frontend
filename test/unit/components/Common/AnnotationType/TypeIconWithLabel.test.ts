import { createLocalVue, shallowMount } from '@vue/test-utils'

import TypeIconWithLabel from '@/components/Common/AnnotationType/TypeIconWithLabel.vue'

const localVue = createLocalVue()

let propsData: {
  type: string
  color: string
  label: string
}

beforeEach(() => {
  propsData = {
    color: 'FF0000',
    label: 'A label',
    type: 'polygon'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TypeIconWithLabel, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
