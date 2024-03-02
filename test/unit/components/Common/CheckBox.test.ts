import { createLocalVue, shallowMount } from '@vue/test-utils'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'

const localVue = createLocalVue()

it('renders checkbox', () => {
  const propsData = {
    name: 'test',
    label: 'Test Checkbox'
  }
  const wrapper = shallowMount(CheckBox, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders circle theme checkbox', () => {
  const propsData = {
    name: 'test',
    label: 'Test Checkbox',
    type: 'circle'
  }
  const wrapper = shallowMount(CheckBox, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits input & change event on change', () => {
  const propsData = {
    name: 'test'
  }
  const wrapper = shallowMount(CheckBox, { localVue, propsData })
  wrapper.find('input').setChecked(true)
  wrapper.find('input').trigger('input')
  expect(wrapper.emitted().input).toEqual([[true]])
  expect(wrapper.emitted().change).toEqual([[{ ...propsData, checked: true }]])
})
