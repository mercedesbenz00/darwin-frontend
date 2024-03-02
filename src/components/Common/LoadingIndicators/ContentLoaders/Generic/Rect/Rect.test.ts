import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import Rect from './Rect.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  dimensions: {
    width: 100,
    height: 50
  }
}

beforeEach(() => {
  wrapper = shallowMount(Rect, { propsData })
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
