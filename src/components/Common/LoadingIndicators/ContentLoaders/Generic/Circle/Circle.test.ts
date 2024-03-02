import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import CircleContentLoader from './Circle.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  size: 40
}

beforeEach(() => {
  wrapper = shallowMount(CircleContentLoader, { propsData })
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
