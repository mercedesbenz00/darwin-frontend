import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import IconToggle from './IconToggle.vue'

let wrapper: Wrapper<Vue>

const propsData = {}

beforeEach(() => {
  wrapper = shallowMount(IconToggle, { propsData })
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
