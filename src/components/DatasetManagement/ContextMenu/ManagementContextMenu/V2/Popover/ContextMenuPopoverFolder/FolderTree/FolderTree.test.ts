import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { buildV2DatasetFolderPayload } from 'test/unit/factories'

import FolderTree from './FolderTree.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  treeLevel: 0,
  subFolder: buildV2DatasetFolderPayload()
}

beforeEach(() => {
  wrapper = shallowMount(FolderTree, { propsData })
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
