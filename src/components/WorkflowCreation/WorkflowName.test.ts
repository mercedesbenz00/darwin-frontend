import { createLocalVue, shallowMount } from '@vue/test-utils'

import WorkflowName from './WorkflowName.vue'

const localVue = createLocalVue()
const propsData: { name: string } = { name: 'old name' }

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowName, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders existing name as readonly', () => {
  const wrapper = shallowMount(WorkflowName, { localVue, propsData })
  expect(wrapper.text()).toContain('old name')
})

it('matches snapshot in edit mode', async () => {
  const wrapper = shallowMount(WorkflowName, { localVue, propsData })
  await wrapper.find('span').trigger('click')
  expect(wrapper).toMatchSnapshot('in edit mode')
})

it('renders existing name in edit mode', async () => {
  const wrapper = shallowMount(WorkflowName, { localVue, propsData })
  await wrapper.find('span').trigger('click')
  expect(wrapper.find('input-field-stub').attributes('value')).toEqual('old name')
})

it('emits name change on input enter', async () => {
  const wrapper = shallowMount(WorkflowName, { localVue, propsData })
  await wrapper.find('span').trigger('click')
  await wrapper.find('input-field-stub').vm.$emit('change', 'new name')
  await wrapper.find('input-field-stub').vm.$emit('enter')
  expect(wrapper.emitted('change')![0]).toEqual(['new name'])
})

it('emits name change on input blur', async () => {
  const wrapper = shallowMount(WorkflowName, { localVue, propsData })
  await wrapper.find('span').trigger('click')
  await wrapper.find('input-field-stub').vm.$emit('change', 'new name')
  await wrapper.find('input-field-stub').vm.$emit('blur')
  expect(wrapper.emitted('change')![0]).toEqual(['new name'])
})

it('enters edit mode on click, exits edit mode on blur', async () => {
  const wrapper = shallowMount(WorkflowName, { localVue, propsData })

  await wrapper.find('span').trigger('click')
  expect(wrapper.find('input-field-stub').exists()).toBe(true)
  await wrapper.find('input-field-stub').vm.$emit('change', 'new name')
  await wrapper.find('input-field-stub').vm.$emit('blur')
  expect(wrapper.text()).toEqual('new name')
  expect(wrapper.find('input-field-stub').exists()).toBe(false)
})

it('resets and exits edit mode on escape', async () => {
  const wrapper = shallowMount(WorkflowName, { localVue, propsData })

  await wrapper.find('span').trigger('click')
  await wrapper.find('input-field-stub').vm.$emit('change', 'new name')
  await wrapper.find('input-field-stub').vm.$emit('escape')
  expect(wrapper.text()).toEqual('old name')
})
