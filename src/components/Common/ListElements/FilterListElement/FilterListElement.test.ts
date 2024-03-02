import { shallowMount } from '@vue/test-utils'

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'
import { IconMonoChevron } from '@/assets/icons/V2/Mono'

import FilterListElement from './FilterListElement.vue'

const propsData = {
  status: 'none',
  meta: {
    id: '0',
    label: 'Test',
    count: 12
  }
}

describe('w/o icons', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(FilterListElement, { propsData })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('with icons', () => {
  it('matches snapshot', () => {
    const slots = {
      prefixIcon: IconDuotoneViewFolder,
      suffixIcon: IconMonoChevron
    }
    const wrapper = shallowMount(FilterListElement, { propsData, slots })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('without count', () => {
  it('matches snapshot', async () => {
    const wrapper = shallowMount(FilterListElement, { propsData })
    await wrapper.setProps({ count: null })
    expect(wrapper).toMatchSnapshot()
  })
})

it('displays label properly', () => {
  const wrapper = shallowMount(FilterListElement, { propsData })
  expect(wrapper.find('.fle__label').text()).toEqual('Test')
})
