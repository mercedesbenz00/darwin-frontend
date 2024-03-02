import { shallowMount, createLocalVue } from '@vue/test-utils'

import NumericInput from '@/components/Common/NumericInput.vue'

const localVue = createLocalVue()

let propsData: {
  value: number
  label: string
  step?: number
}

it('matches snapshot', () => {
  propsData = { value: 10, label: 'Number' }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('works when setting value directly', async () => {
  propsData = { value: 50, label: 'Number' }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })

  const input = (wrapper.find('input').element as HTMLInputElement)

  input.value = '54'
  await wrapper.find('input').trigger('change')

  input.value = '55'
  await wrapper.find('input').trigger('change')

  expect(wrapper.emitted().change).toEqual([[54], [55]])
})

it('emits dirty/clean when changing value directly', async () => {
  propsData = { value: 50, label: 'Number', step: 10 }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })

  const input = (wrapper.find('input').element as HTMLInputElement)

  input.value = '64'
  await wrapper.find('input').trigger('change')
  expect(wrapper.emitted().dirty).toHaveLength(1)
  expect(wrapper.emitted().clean).toHaveLength(1)
})

it('rounds to nearest multiple of step when changing directly', async () => {
  propsData = { value: 50, label: 'Number', step: 10 }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })

  const input = (wrapper.find('input').element as HTMLInputElement)

  input.value = '64'
  await wrapper.find('input').trigger('change')

  input.value = '75'
  await wrapper.find('input').trigger('change')

  expect(wrapper.emitted().change).toEqual([[60], [80]])
})

it('resets input if rolled back due to step', async () => {
  propsData = { value: 1000, label: 'Number', step: 100 }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })

  const input = (wrapper.find('input').element as HTMLInputElement)

  input.value = '1009'
  await wrapper.find('input').trigger('change')

  expect(input.value).toEqual('1000')
})

it('works when incrementing value', async () => {
  propsData = { value: 50, label: 'Number' }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })
  await wrapper.find('.numeric-input__controls__buttons__up').trigger('click')
  expect(wrapper.emitted().change).toEqual([[51]])
})

it('increments by step value', async () => {
  propsData = { value: 50, label: 'Number', step: 10 }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })
  await wrapper.find('.numeric-input__controls__buttons__up').trigger('click')
  expect(wrapper.emitted().change).toEqual([[60]])
})

it('works when decrementing value', async () => {
  propsData = { value: 50, label: 'Number' }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })
  await wrapper.find('.numeric-input__controls__buttons__down').trigger('click')
  expect(wrapper.emitted().change).toEqual([[49]])
})

it('decrements by step value', async () => {
  propsData = { value: 50, label: 'Number', step: 10 }
  const wrapper = shallowMount(NumericInput, { localVue, propsData })
  await wrapper.find('.numeric-input__controls__buttons__down').trigger('click')
  expect(wrapper.emitted().change).toEqual([[40]])
})
