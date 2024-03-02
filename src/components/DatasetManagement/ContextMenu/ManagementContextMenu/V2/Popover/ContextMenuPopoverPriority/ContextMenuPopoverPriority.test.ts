import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import ContextMenuPopoverPriority from './ContextMenuPopoverPriority.vue'

let wrapper: Wrapper<Vue>

const propsData = {}

beforeEach(() => {
  wrapper = shallowMount(ContextMenuPopoverPriority, { propsData })
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
