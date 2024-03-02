import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import { buildV2DatasetFolderPayload } from 'test/unit/factories'

import ContextMenuPopoverFolder from './ContextMenuPopoverFolder.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let wrapper: Wrapper<Vue>
let store: ReturnType<typeof initializeStore>

const propsData = {}

beforeEach(() => {
  store = initializeStore()
  store.commit('dataset/SET_V2_DATASET_FOLDERS', {
    datasetId: 1,
    folders: [
      buildV2DatasetFolderPayload({
        path: '/bin',
        dataset_id: 1,
        filtered_item_count: 1
      }),
      buildV2DatasetFolderPayload({
        path: '/bin/trash-files',
        dataset_id: 1,
        filtered_item_count: 1
      }),
      buildV2DatasetFolderPayload({
        path: '/root',
        dataset_id: 1,
        filtered_item_count: 1
      }),
      buildV2DatasetFolderPayload({
        path: '/root/cats',
        dataset_id: 1,
        filtered_item_count: 1
      }),
      buildV2DatasetFolderPayload({
        path: '/root/dogs',
        dataset_id: 1,
        filtered_item_count: 1
      }),
      buildV2DatasetFolderPayload({
        path: '/root/dogs/paws',
        dataset_id: 1,
        filtered_item_count: 1
      }),
      buildV2DatasetFolderPayload({
        path: '/root/birds',
        dataset_id: 1,
        filtered_item_count: 1
      })
    ]
  })
  wrapper = shallowMount(ContextMenuPopoverFolder, {
    propsData,
    store,
    localVue
  })
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
