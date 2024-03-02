import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import TableRow from './TableRow.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  tableId: '123',
  row: 0
}

beforeEach(() => {
  wrapper = shallowMount(TableRow, { propsData })
})

afterEach(() => {
  wrapper.destroy()
})

it('should render properly', () => {
  expect(wrapper.exists()).toBeTruthy()
})
