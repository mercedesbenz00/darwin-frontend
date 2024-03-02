import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import TableFolderToggle from './TableFolderToggle.vue'

let wrapper: Wrapper<Vue>

beforeEach(() => {
  wrapper = shallowMount(TableFolderToggle, { propsData: { active: true } })
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

it('should have the correct class applied', async () => {
  expect(wrapper.attributes().class).toContain('table-folder--active')
  await wrapper.setProps({ active: false })
  expect(wrapper.attributes().class).toContain('table-folder--inactive')
})
