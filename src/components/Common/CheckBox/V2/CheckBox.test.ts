import { createLocalVue, shallowMount } from '@vue/test-utils'

import CheckBoxV2 from '@/components/Common/CheckBox/V2/CheckBox.vue'

const localVue = createLocalVue()

it('renders checkbox', () => {
  const propsData = {
    name: 'test',
    label: 'Test Checkbox'
  }
  const wrapper = shallowMount(CheckBoxV2, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders circle theme checkbox', () => {
  const propsData = {
    name: 'test',
    label: 'Test Checkbox',
    type: 'circle'
  }
  const wrapper = shallowMount(CheckBoxV2, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits input & change event on change', () => {
  const propsData = {
    name: 'test'
  }
  const wrapper = shallowMount(CheckBoxV2, { localVue, propsData })
  wrapper.find('input').setChecked(true)
  wrapper.find('input').trigger('input')
  expect(wrapper.emitted().input).toEqual([[true]])
  expect(wrapper.emitted().change).toEqual([[{ ...propsData, checked: true }]])
})
