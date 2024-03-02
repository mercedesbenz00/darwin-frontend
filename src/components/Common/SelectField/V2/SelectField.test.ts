import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { ListElementV2Props } from '@/components/Common/ListElements/ListElementV2/types'
import { PopupMenuV2 } from '@/components/Common/PopupMenu/V2'
import clickOutsideDirective from '@/directives/click-outside'

import { SelectField } from '.'

const localVue = createLocalVue()
localVue.directive('click-outside', clickOutsideDirective)

const components = {
  PopupMenuV2
}

type SelectFieldProps = {
  value: string,
  options: ListElementV2Props[],
  label?: string,
  empty?: string,
  required?: boolean,
  disabled?: boolean,
  custom?: boolean
}

it('matches snapshot', () => {
  const propsData: SelectFieldProps = {
    value: 'value-1',
    options: [
      { id: 'value-0', text: 'value 0' },
      { id: 'value-1', text: 'value 1' },
      { id: 'value-2', text: 'value 2' },
      { id: 'value-3', text: 'value 3' }
    ]
  }
  const wrapper = shallowMount(SelectField, {
    localVue,
    components,
    propsData,
    data: () => ({ open: true })
  })
  expect(wrapper).toMatchSnapshot()
})

describe('when has label prop', () => {
  let wrapper: Wrapper<Vue, Element>

  beforeEach(() => {
    const propsData: SelectFieldProps = {
      value: 'value-1',
      options: [
        { id: 'value-0', text: 'value 0' },
        { id: 'value-1', text: 'value 1' },
        { id: 'value-2', text: 'value 2' },
        { id: 'value-3', text: 'value 3' }
      ],
      label: 'label text'
    }
    wrapper = shallowMount(SelectField, {
      localVue,
      components,
      propsData
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('matches snapshot with label', () => {
    expect(wrapper.find('.select-field__input__label').exists()).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('show no popup menu if open equals false', async () => {
    await wrapper.setData({ open: false })
    expect(wrapper.find('.popup-menu').exists()).toBe(false)
    expect(wrapper).toMatchSnapshot()
  })

  it('show popup menu if open equals true', () => {
    wrapper.setData({ open: true })
    expect(wrapper.find('.popup-menu').exists()).toBe(false)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when has empty prop', () => {
  let wrapper: Wrapper<Vue, Element>

  beforeEach(() => {
    const propsData: SelectFieldProps = {
      value: 'value-1',
      options: [],
      empty: 'the dropdown is empty'
    }
    wrapper = shallowMount(SelectField, {
      localVue,
      components,
      propsData,
      data: () => ({ open: true })
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('matches snapshot with empty', () => {
    const noContent = wrapper.find('.popup-menu__no-content')
    expect(noContent.exists()).toBe(true)
    expect(noContent.text()).toBe('the dropdown is empty')
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when has disabled prop', () => {
  let wrapper: Wrapper<Vue, Element>

  beforeEach(() => {
    const propsData: SelectFieldProps = {
      value: 'value-1',
      options: [],
      disabled: true
    }
    wrapper = shallowMount(SelectField, {
      localVue,
      components,
      propsData,
      data: () => ({ open: true })
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('matches snapshot with disabled', () => {
    const input = wrapper.find('.select-field__input')
    expect(input.classes().includes('select-field__input--disabled')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when used sort slot', () => {
  let wrapperSlotted: Wrapper<Vue, Element>

  beforeEach(() => {
    const propsData: SelectFieldProps = {
      value: 'value-1',
      options: [
        { id: 'value-0', text: 'value 0' },
        { id: 'value-1', text: 'value 1' },
        { id: 'value-2', text: 'value 2' },
        { id: 'value-3', text: 'value 3' }
      ]
    }
    wrapperSlotted = shallowMount(SelectField, {
      localVue,
      propsData,
      slots: {
        icon: { template: '<svg id="icon" />' },
        label: { template: '<div id="label" />' },
        default: { template: '<div class="custom-option" />' },
        'dropdown-header': { template: '<div id="header" />' },
        'dropdown-footer': { template: '<div id="footer" />' }
      },
      data: () => ({ open: true })
    })
  })

  afterEach(() => {
    wrapperSlotted.destroy()
  })

  it('should have a div within its icon slot', () => {
    expect(wrapperSlotted.find('#icon').exists()).toBe(true)
  })

  it('should have a div within its label slot', () => {
    expect(wrapperSlotted.find('#label').exists()).toBe(true)
  })

  it('should have a div within its default slot', () => {
    expect(wrapperSlotted.findAll('.custom-option').length).toBe(4)
  })

  it('should have a div within its header slot', () => {
    expect(wrapperSlotted.find('#header').exists()).toBe(true)
  })

  it('should have a div within its footer slot', () => {
    expect(wrapperSlotted.find('#footer').exists()).toBe(true)
  })
})

describe('when submitting using arrow keys', () => {
  let wrapper: Wrapper<Vue, Element>

  beforeEach(() => {
    const propsData: SelectFieldProps = {
      value: 'value-1',
      options: [
        { id: 'value-0', text: 'value 0' },
        { id: 'value-1', text: 'value 1' },
        { id: 'value-2', text: 'value 2' },
        { id: 'value-3', text: 'value 3' }
      ]
    }
    wrapper = shallowMount(SelectField, { localVue, propsData })
  })

  it('select the next value open and hitting ARROW DOWN', async () => {
    await wrapper.setData({ open: true })
    expect((wrapper.vm as any).selected).toEqual('value-1')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect((wrapper.vm as any).selected).toEqual('value-2')
  })

  it('do not select the next value closed and hitting ARROW UP', async () => {
    await wrapper.setData({ open: false })
    expect((wrapper.vm as any).selected).toEqual('value-1')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect((wrapper.vm as any).selected).toEqual('value-1')
  })

  it('select the prev value open and hitting ARROW UP', async () => {
    await wrapper.setData({ open: true })
    expect((wrapper.vm as any).selected).toEqual('value-1')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect((wrapper.vm as any).selected).toEqual('value-0')
  })

  it('do not select the prev value closed and hitting ARROW UP', async () => {
    await wrapper.setData({ open: false })
    expect((wrapper.vm as any).selected).toEqual('value-1')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect((wrapper.vm as any).selected).toEqual('value-1')
  })

  it('submit the selected value when open and hitting ENTER', async () => {
    await wrapper.setData({ open: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()?.input).toEqual([[{ id: 'value-1', text: 'value 1' }]])
  })

  it('not submit the selected value when closed and hitting ENTER', async () => {
    await wrapper.setData({ open: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()?.input).not.toBeDefined()
  })
})
