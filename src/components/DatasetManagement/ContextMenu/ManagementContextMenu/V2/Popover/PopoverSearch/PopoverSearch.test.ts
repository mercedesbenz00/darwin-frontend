import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import PopoverSearch from './PopoverSearch.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  value: ''
}

beforeEach(() => {
  wrapper = shallowMount(PopoverSearch, { propsData })
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
