import { createLocalVue, shallowMount } from '@vue/test-utils'

import TextArea from '@/components/Common/TextArea.vue'
const localVue = createLocalVue()

let propsData: {
  disabled?: boolean
  id?: string
  label?: string | null
  name?: string
  placeholder?: string
  theme?: 'dark' | 'light'
  value: string,
}

it('matches snapshot', () => {
  propsData = { value: 'Foo' }
  const wrapper = shallowMount(TextArea, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders as disabled', async () => {
  propsData = { value: 'Foo', disabled: true }
  const wrapper = shallowMount(TextArea, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()

  expect(wrapper.find('textarea').attributes('disabled')).toBe('disabled')

  wrapper.setProps({ disabled: false })
  await wrapper.vm.$nextTick()
  expect(wrapper.find('textarea').attributes('disabled')).toBe(undefined)
})
