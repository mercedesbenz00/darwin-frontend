import { createLocalVue, shallowMount } from '@vue/test-utils'

import { VPopover } from 'test/unit/stubs'

import SamplingRate from '@/components/DatasetSettings/Stage/SamplingRate.vue'

const localVue = createLocalVue()
localVue.component('VPopover', VPopover)

it('matches snapshot', () => {
  const propsData = { value: 0.5 }
  const wrapper = shallowMount(SamplingRate, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders value as percentage', async () => {
  const propsData = { value: 0.5 }
  const wrapper = shallowMount(SamplingRate, { localVue, propsData })
  expect(wrapper.find('input-field-stub').props('value')).toEqual('50')
  await wrapper.setProps({ value: 0.2 })
  expect(wrapper.find('input-field-stub').props('value')).toEqual('20')

  await wrapper.setProps({ value: 0.02 })
  expect(wrapper.find('input-field-stub').props('value')).toEqual('2')

  await wrapper.setProps({ value: 0.0 })
  expect(wrapper.find('input-field-stub').props('value')).toEqual('0')

  await wrapper.setProps({ value: 1.0 })
  expect(wrapper.find('input-field-stub').props('value')).toEqual('100')
})

it('emits change in 0.0 - 1.0 format', async () => {
  const propsData = { value: 0.5 }
  const wrapper = shallowMount(SamplingRate, { localVue, propsData })
  await wrapper.find('input-field-stub').vm.$emit('input', '70')
  expect((wrapper.emitted().change || [])[0]).toEqual([0.7])

  await wrapper.find('input-field-stub').vm.$emit('input', '0')
  expect((wrapper.emitted().change || [])[1]).toEqual([0.0])

  await wrapper.find('input-field-stub').vm.$emit('input', '100')
  expect((wrapper.emitted().change || [])[2]).toEqual([1.0])
})

it('prevents out of range changes', async () => {
  const propsData = { value: 0.5 }
  const wrapper = shallowMount(SamplingRate, { localVue, propsData })
  await wrapper.find('input-field-stub').vm.$emit('input', '-70')
  expect((wrapper.emitted().change || [])[0]).toEqual([0.0])

  await wrapper.find('input-field-stub').vm.$emit('input', '120')
  expect((wrapper.emitted().change || [])[1]).toEqual([1.0])
})
