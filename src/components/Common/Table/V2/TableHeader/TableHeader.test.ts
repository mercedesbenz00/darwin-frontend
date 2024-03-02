import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import TableHeaderColumn from '@/components/Common/Table/V2/TableHeaderColumn/TableHeaderColumn.vue'

import TableHeader from './TableHeader.vue'

let wrapper: Wrapper<Vue>

const stubs = {
  'table-header-column': TableHeaderColumn
}

const propsData = {
  id: '123',
  items: [
    {
      id: '1',
      label: 'Test Column 1',
      sortAction: jest.fn(() => {}),
      minColumnSize: 100,
      resizeable: true,
      tableId: '123',
      totalItems: 6
    },
    {
      id: '2',
      label: 'Test Column 2',
      sortAction: jest.fn(() => {}),
      minColumnSize: 100,
      resizeable: true,
      tableId: '123',
      totalItems: 6
    }
  ]
}

beforeEach(() => {
  wrapper = shallowMount(TableHeader, { propsData, stubs })
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

it('should have the correct container id', () => {
  expect(wrapper.attributes().id).toEqual('table-root_123')
})

it('should display all columns', () => {
  const columns = wrapper.findAll('.column-head__container')
  expect(columns.length).toEqual(2)
})
