import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { SortIcon } from '@/components/Common/Table/V2/TableHeaderColumn/SortIcon'

import TableHeaderColumn from './TableHeaderColumn.vue'

let wrapper: Wrapper<Vue>

const stubs = {
  'sort-icon': SortIcon
}

const propsData = {
  tableId: '123',
  totalItems: 6,
  label: 'Test Column',
  sortAction: jest.fn(() => {}),
  minColumnSize: 100,
  resizeable: true,
  position: 0
}

beforeEach(() => {
  wrapper = shallowMount(TableHeaderColumn, {
    propsData,
    stubs
  })
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

it('should display the label properly', () => {
  expect(wrapper.find('.column-head__label').text()).toEqual('Test Column')
})

it('should toggle the icon properly', async () => {
  expect(wrapper.find('.sort-icon__wrapper')).toBeTruthy()
  await wrapper.setProps({ ...propsData, sortAction: null })
  expect(wrapper.find('.sort-icon__wrapper').exists()).toBeFalsy()
})

it('should disable the resizer when not resizeable', async () => {
  await wrapper.setProps({ ...propsData, resizeable: false })
  expect(wrapper.find('.column-resize-area').attributes().class).toContain(
    'column-resize-area--disabled'
  )
})
