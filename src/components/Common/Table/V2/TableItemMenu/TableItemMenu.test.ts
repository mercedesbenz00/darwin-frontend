import { shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { buildV2DatasetItemPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import TableItemMenu from './TableItemMenu.vue'

let wrapper: Wrapper<Vue>
const stubs: Stubs = { VPopover }
const propsData = {
  data: buildV2DatasetItemPayload()
}

beforeEach(() => {
  wrapper = shallowMount(TableItemMenu, { propsData, stubs })
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
