import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import TabItem from './TabItem.vue'
import { TabSize } from './types'

let wrapper: Wrapper<Vue>

const propsData = {
  id: 'abc',
  label: 'Overview',
  size: TabSize.SMALL,
  active: false
}

beforeEach(() => {
  wrapper = shallowMount(TabItem, { propsData })
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

it('should render the label properly', () => {
  expect(wrapper.find('.tab__label').text()).toEqual('Overview')
})

it('should apply correct classes', async () => {
  expect(wrapper.find('.tab--small').exists()).toBeTruthy()
  expect(wrapper.find('.tab--large').exists()).toBeFalsy()
  expect(wrapper.find('.tab-active').exists()).toBeFalsy()
  await wrapper.setProps({ ...propsData, active: true })
  expect(wrapper.find('.tab-active').exists()).toBeTruthy()
})
