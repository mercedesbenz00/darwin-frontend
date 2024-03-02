import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import PriorityForm from './PriorityForm.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(PriorityForm, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('emits 0 when you select 0 priority', async () => {
  const wrapper = shallowMount(PriorityForm, { localVue })
  await wrapper.find('.priority-form__value-null').trigger('click')
  expect(wrapper.emitted()['update:priority']).toEqual([[0]])
  expect(wrapper.emitted().submit).toEqual([[0]])
})

Array(5).fill(0).forEach((_, index) => {
  it(`emits priority when you select ${index + 1} priority`, async () => {
    const wrapper = shallowMount(PriorityForm, { localVue })
    await wrapper.find(`.priority-form__value-${index + 1}`).trigger('click')
    expect(wrapper.emitted()['update:priority']).toEqual([[index + 1]])
    expect(wrapper.emitted().submit).toEqual([[index + 1]])
  })
})

it('emits custom priority when you submit priority', async () => {
  const wrapper = shallowMount(PriorityForm, { localVue })
  const inputField: Wrapper<Vue, HTMLInputElement> = wrapper.find('input')
  inputField.element.value = '12'
  await inputField.trigger('input')
  await inputField.trigger('keydown.enter')
  expect(wrapper.emitted()['update:priority']).toEqual([[12]])
  expect(wrapper.emitted().submit).toEqual([[12]])
})

it('validates input to be number', async () => {
  const wrapper = shallowMount(PriorityForm, { localVue })
  const inputField: Wrapper<Vue, HTMLInputElement> = wrapper.find('input')
  inputField.element.value = 'test'
  await inputField.trigger('input')
  await inputField.trigger('keyup', {})
  expect(wrapper.vm.$data.customPriority).toEqual('')
})
