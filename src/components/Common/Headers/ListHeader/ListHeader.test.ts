import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'

import ListHeader from './ListHeader.vue'
import { ListHeader as Props, ListHeaderSize as Size, ListHeaderVariant as Variant } from './types'

let wrapper: Wrapper<Vue>

const propsData: Props = {
  size: Size.MD,
  variant: Variant.ELEVATE,
  label: 'Test'
}

const slots = {
  default: IconDuotoneViewFolder
}

describe('with icon', () => {
  beforeEach(() => {
    wrapper = shallowMount(ListHeader, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should render properly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

describe('w/o icon', () => {
  beforeEach(() => {
    wrapper = shallowMount(ListHeader, { propsData, slots })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should render properly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

beforeEach(() => {
  wrapper = shallowMount(ListHeader, { propsData })
})

it('should have the correct size applied', () => {
  expect(wrapper.attributes().class).toContain('--medium')
})

it('should have the correct variant applied', () => {
  expect(wrapper.attributes().class).toContain('--elevate')
})

it('should display correct label', () => {
  expect(wrapper.find('.list-header__label').text()).toEqual('Test')
})
