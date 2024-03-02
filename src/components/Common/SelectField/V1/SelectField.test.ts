import { createLocalVue, shallowMount } from '@vue/test-utils'

import SelectField from './SelectField.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(SelectField, {
    localVue,
    propsData: {
      value: 'value',
      options: ['value', 'value 1', 'value 2', 'value 3']
    }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with label', () => {
  const wrapper = shallowMount(SelectField, {
    localVue,
    propsData: {
      value: 'value',
      options: ['value', 'value 1', 'value 2', 'value 3'],
      label: 'label text'
    }
  })
  expect(wrapper.find('.select-field__label').exists).toBeTruthy()
  expect(wrapper).toMatchSnapshot()
})
