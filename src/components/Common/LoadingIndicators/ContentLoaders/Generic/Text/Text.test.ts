import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import Text from './Text.vue'
import { TextSize } from './types'

let wrapper: Wrapper<Vue>

const propsData = {
  variant: TextSize.LG,
  width: 126
}

beforeEach(() => {
  wrapper = shallowMount(Text, { propsData })
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
