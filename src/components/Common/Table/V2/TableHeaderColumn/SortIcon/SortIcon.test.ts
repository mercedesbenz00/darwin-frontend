import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { SortMode } from '@/components/Common/Table/V2/TableHeaderColumn/SortIcon/types'

import SortIcon from './SortIcon.vue'

let wrapper: Wrapper<Vue>

beforeEach(() => {
  wrapper = shallowMount(SortIcon, { propsData: { mode: SortMode.DESC } })
})

afterEach(() => {
  wrapper.destroy()
})

it('should match snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

it('should render properly', () => {
  expect(wrapper.exists()).toBeTruthy()
})

it('should rotate icon on different mode', async () => {
  expect(wrapper.html().includes('0deg')).toBeTruthy()
  await wrapper.setProps({ mode: SortMode.ASC })
  expect(wrapper.html().includes('180deg')).toBeTruthy()
})
