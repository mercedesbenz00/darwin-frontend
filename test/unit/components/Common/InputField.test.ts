import { shallowMount, createLocalVue } from '@vue/test-utils'

import InputField from '@/components/Common/InputField/V1/InputField.vue'

const localVue = createLocalVue()

let propsData: {
  value: string | number

  autocomplete?: string
  autofill?: boolean
  autoFocus?: boolean
  disabled?: boolean
  error?: string
  feeds?: { id: string | number, value: string | number }[]
  hint?: string
  id?: string | number
  label?: string
  max?: number
  maxlength?: number
  min?: number
  name?: string
  placeholder?: string
  readonly?: boolean
  required?: string
  theme?: 'dark' | 'light'
  type?: string
}

describe('basic behavior', () => {
  beforeEach(() => {
    propsData = { value: 'Foo' }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('binds value', () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    const input = (wrapper.find('input').element as HTMLInputElement)
    expect(input.value).toEqual('Foo')
  })

  it('emits change/input', () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    expect(wrapper.find('input').setValue('Bar'))
    expect(wrapper.emitted().input).toEqual([['Bar']])
    expect(wrapper.emitted().change).toEqual([['Bar']])
  })
})

describe('prop-based validation error', () => {
  propsData = { value: 'Foo' }

  it('matches snapshot', async () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    wrapper.setProps({ error: 'Foo Error' })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })

  it('renders error', async () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    wrapper.setProps({ error: 'Foo Error' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.inputfield__error').text()).toEqual('Foo Error')
  })

  it('clears error when typing', async () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    wrapper.setProps({ error: 'Foo Error' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.inputfield__error').exists()).toBe(true)

    wrapper.setProps({ value: 'Foo2' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.inputfield__error').exists()).toBe(false)

    wrapper.setProps({ error: 'Foo Error 2' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.inputfield__error').exists()).toBe(true)
  })
})

describe('setError-based validation error', () => {
  propsData = { value: 'Foo' }

  it('matches snapshot', async () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })

    const component = wrapper.vm as any
    component.setError('Foo Error')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })

  it('renders error', async () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    const component = wrapper.vm as any

    component.setError('Foo Error')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.inputfield__error').text()).toEqual('Foo Error')
  })

  it('clears error when typing', async () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    const component = wrapper.vm as any

    component.setError('Foo Error')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.inputfield__error').exists()).toBe(true)

    wrapper.setProps({ value: 'Foo2' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.inputfield__error').exists()).toBe(false)

    component.setError('Foo Error 2')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.inputfield__error').exists()).toBe(true)
  })
})
