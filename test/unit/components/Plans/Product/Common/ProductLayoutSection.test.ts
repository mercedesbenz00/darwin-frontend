import { createLocalVue, shallowMount } from '@vue/test-utils'

import ProductLayoutSection from '@/components/Plans/Product/Common/ProductLayoutSection.vue'

const localVue = createLocalVue()

const propsData = {
  text: '100',
  subtext: 'Credits Monthly'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(ProductLayoutSection, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders props', () => {
  const wrapper = shallowMount(ProductLayoutSection, { localVue, propsData })
  expect(wrapper.text()).toContain('100')
  expect(wrapper.text()).toContain('Credits Monthly')
})
