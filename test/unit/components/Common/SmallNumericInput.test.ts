import { createLocalVue, shallowMount } from '@vue/test-utils'

import SmallNumericInput from '@/components/Common/SmallNumericInput.vue'

const localVue = createLocalVue()

it('matches snapshot with default props', () => {
  const propsData = { value: 30 }
  const wrapper = shallowMount(SmallNumericInput, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with mix, max props', () => {
  const propsData = {
    value: 30,
    min: 10,
    max: 50
  }
  const wrapper = shallowMount(SmallNumericInput, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits input when input value change', async () => {
  const propsData = { value: 30 }
  const wrapper = shallowMount(SmallNumericInput, { localVue, propsData })
  await wrapper.find('input').vm.$emit('input', 20)
  expect(wrapper.emitted().input).toEqual([[20]])
})

it('blur input when enter or esc key is pressed', async () => {
  const propsData = { value: 30 }
  const wrapper = shallowMount(SmallNumericInput, { localVue, propsData })
  const component = wrapper.vm as any
  component.$refs.input = { blur: jest.fn() }
  await wrapper.find('input').trigger('keydown', { key: 'Enter' })
  expect(component.$refs.input.blur).toBeCalled()
})
