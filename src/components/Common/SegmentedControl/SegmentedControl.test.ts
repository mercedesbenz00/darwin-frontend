import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import SegmentedControl from './SegmentedControl.vue'
import { SegmentedControl as Types, SegmentedControlVariant, Tab as TabTypes } from './types'

let wrapper: Wrapper<Vue>

const buildSegmentedTab = (options?: Partial<TabTypes>): TabTypes => ({
  id: '1',
  label: 'Test',
  iconName: null,
  ...options
})

const propsData: Types = {
  id: '123',
  tabs: [
    buildSegmentedTab(),
    buildSegmentedTab({ id: '2' }),
    buildSegmentedTab({ id: '3' }),
    buildSegmentedTab({ id: '4' })
  ],
  variant: SegmentedControlVariant.SMALL,
  activeIndex: 0
}

describe('with tabs', () => {  
  it('should render properly', () => {
    wrapper = shallowMount(SegmentedControl, { propsData })
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    wrapper = shallowMount(SegmentedControl, { propsData })
    expect(wrapper).toMatchSnapshot()
  })
})
