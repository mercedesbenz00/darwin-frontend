import { shallowMount, createLocalVue, Stubs } from '@vue/test-utils'

import Dropdown from '@/components/Common/Dropdown/LegacyDropdown.vue'

const localVue = createLocalVue()

let propsData: {
  options: { id: string | number, text: string }[]
  value: string | number

  autocomplete?: string
  disabled?: boolean
  label?: string
  noBorder?: boolean
  placeholder?: string
  readonly?: boolean
  search?: boolean
  size?: string
  white?: boolean
}

beforeEach(() => {
  propsData = {
    options: [
      { id: 1, text: 'Foo' },
      { id: 2, text: 'Bar' }
    ],
    value: 1
  }
})

const stubs: Stubs = { Select2: true }

describe('basic behavior', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('binds value', () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })
    expect(wrapper.find('select2-stub').props('value')).toEqual(1)
  })

  it('emits change/input', () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })
    wrapper.find('select2-stub').vm.$emit('select', propsData.options[1])
    expect(wrapper.emitted().input).toEqual([[2]])
    expect(wrapper.emitted().change).toEqual([[2]])
  })
})

describe('prop-based validation error', () => {
  it('matches snapshot', async () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })
    wrapper.setProps({ error: 'Foo Error' })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })

  it('renders error', async () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })
    wrapper.setProps({ error: 'Foo Error' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown__error').text()).toEqual('Foo Error')
  })

  it('clears error when typing', async () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })
    wrapper.setProps({ error: 'Foo Error' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown__error').exists()).toBe(true)

    wrapper.setProps({ value: 'Foo2' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown__error').exists()).toBe(false)

    wrapper.setProps({ error: 'Foo Error 2' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown__error').exists()).toBe(true)
  })
})

describe('setError-based validation error', () => {
  it('matches snapshot', async () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })

    const component = wrapper.vm as any
    component.setError('Foo Error')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })

  it('renders error', async () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })
    const component = wrapper.vm as any

    component.setError('Foo Error')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown__error').text()).toEqual('Foo Error')
  })

  it('clears error when typing', async () => {
    const wrapper = shallowMount(Dropdown, { localVue, propsData, stubs })
    const component = wrapper.vm as any

    component.setError('Foo Error')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown__error').exists()).toBe(true)

    wrapper.setProps({ value: 'Foo2' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown__error').exists()).toBe(false)

    component.setError('Foo Error 2')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown__error').exists()).toBe(true)
  })
})
