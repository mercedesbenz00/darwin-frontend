import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { Tab as TabTypes } from '@/components/Common/SegmentedControl/types'

import Tab from './Tab.vue'

let wrapper: Wrapper<Vue>

const buildSegementedTab = (options?: Partial<TabTypes>) => ({
  id: '1',
  label: 'Test',
  iconName: null,
  ...options
})

describe('no icon', () => {
  beforeEach(() => {
    wrapper = shallowMount(Tab, { propsData: buildSegementedTab() })
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

describe('with icon', () => {
  beforeEach(() => {
    wrapper = shallowMount(Tab, { propsData: buildSegementedTab({ iconName: 'icon-mono-idle' }) })
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
