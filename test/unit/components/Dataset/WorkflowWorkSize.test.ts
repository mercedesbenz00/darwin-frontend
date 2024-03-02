import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import WorkflowWorkSize from '@/components/Dataset/WorkflowWorkSize.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

const stubs: Stubs = ['info', 'input-field']

it('matches snapshot', () => {
  const propsData = { value: 20 }
  const wrapper = shallowMount(WorkflowWorkSize, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits input when value changes', () => {
  const propsData = { value: 20 }
  const wrapper = shallowMount(WorkflowWorkSize, { localVue, propsData, stubs })
  wrapper.find('input-field-stub').vm.$emit('input', '30')
  expect(wrapper.emitted().input).toEqual([[30]])
})
