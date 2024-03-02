import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import TableItem from './TableItem.vue'

let wrapper: Wrapper<Vue>

beforeEach(() => {
  wrapper = shallowMount(TableItem, { propsData: { col: 2, tableId: '123' } })
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

it('should match the id', () => {
  expect(wrapper.attributes().id).toEqual('table-item_123_2')
})

it('should match styles', () => {
  expect(wrapper.attributes().style).toContain('z-index: 998')
  expect(wrapper.attributes().style).toContain('width: 100px')
})
