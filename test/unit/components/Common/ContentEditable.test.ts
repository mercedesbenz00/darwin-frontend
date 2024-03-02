import { createLocalVue, shallowMount } from '@vue/test-utils'

import ContentEditable from '@/components/Common/ContentEditable.vue'

const localVue = createLocalVue()
const stubs = ['router-link', 'router-view']
let propsData: {
  value: string
  placeholder?: string
  tag?: string
  disabled?: boolean
  disableMultiline?: boolean
}

it('matches snapshot', () => {
  propsData = { tag: 'h1', value: 'New Model' }
  const wrapper = shallowMount(ContentEditable, { localVue, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when disabled', () => {
  propsData = { disabled: true, tag: 'h1', value: 'New Model' }
  const wrapper = shallowMount(ContentEditable, { localVue, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with placeholder', () => {
  propsData = { placeholder: 'Placeholder', tag: 'h1', value: 'New Model' }
  const wrapper = shallowMount(ContentEditable, { localVue, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('triggers event on content change', () => {
  propsData = { tag: 'h1', value: 'New Model' }
  const wrapper = shallowMount(ContentEditable, { localVue, stubs, propsData })

  wrapper.find<HTMLHeadingElement>('h1').element.innerText = 'Old Model'
  wrapper.find('h1').trigger('input')

  expect(wrapper.emitted().input).toEqual([['Old Model']])
  expect(wrapper.emitted().change).toEqual([['Old Model']])
})

it('handles enter event when no enter listener and multiline disabled', async () => {
  propsData = { tag: 'h1', value: 'New Model', disableMultiline: true }
  const wrapper = shallowMount(ContentEditable, { localVue, stubs, propsData })
  const component = wrapper.vm as any
  component.$refs = {
    editable: { blur: jest.fn() }
  }

  await wrapper.find('h1').trigger('keydown.enter')

  expect(component.$refs.editable.blur).toBeCalled()
})

it('emits enter event when enter listener added', async () => {
  const listeners = { enter: jest.fn() }
  propsData = { tag: 'h1', value: 'New Model', disableMultiline: true }
  const wrapper = shallowMount(ContentEditable, { localVue, listeners, stubs, propsData })
  const component = wrapper.vm as any
  component.$refs = {
    editable: { blur: jest.fn() }
  }

  await wrapper.find('h1').trigger('keydown.enter')

  expect(listeners.enter).toBeCalled()
})
