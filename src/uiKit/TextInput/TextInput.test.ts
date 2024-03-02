import { shallowMount, createLocalVue } from '@vue/test-utils'

import { InputField } from '@/components/Common/InputField/V2'

import { TextInputProps } from './types'

const localVue = createLocalVue()

let propsData: TextInputProps

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
    await wrapper.setProps({ error: 'Foo Error' })
    expect(wrapper.find('.inputfield__error').exists()).toBe(true)

    await wrapper.setProps({ value: 'Foo2', error: null })
    expect(wrapper.find('.inputfield__error').exists()).toBe(false)

    await wrapper.setProps({ error: 'Foo Error 2' })
    expect(wrapper.find('.inputfield__error').exists()).toBe(true)
  })
})

describe('when multiple it\'s active', () => {
  beforeEach(() => {
    propsData = {
      value: '',
      multiple: true
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes', () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    const itemsWrapper = wrapper.find('.inputfield-items__wrapper')
    expect(itemsWrapper.exists()).toBe(true)
    const input = wrapper.find('.inputfield--multiple')
    expect(input.exists()).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when multiple and wrap it\'s active', () => {
  beforeEach(() => {
    propsData = {
      value: '',
      multiple: true,
      wrap: true,
      items: [{ label: 'foo' }, { label: 'bar' }, { label: 'baz' }]
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes', () => {
    const wrapper = shallowMount(InputField, { localVue, propsData })
    const itemsWrapper = wrapper.find('.inputfield-items__wrapper')
    expect(itemsWrapper.exists()).toBe(true)
    const input = wrapper.find('.inputfield--multiple--wrap')
    expect(input.exists()).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})
