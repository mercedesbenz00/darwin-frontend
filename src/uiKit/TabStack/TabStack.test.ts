import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { TabSize } from './TabItem/types'
import TabStack from './TabStack.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  tabs: [],
  size: TabSize.SMALL,
  activeTab: 0
}

beforeEach(() => {
  wrapper = shallowMount(TabStack, { propsData })
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
