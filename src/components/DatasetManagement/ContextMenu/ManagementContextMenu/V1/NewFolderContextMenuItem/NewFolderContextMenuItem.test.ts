import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildDatasetFolderPayload,
  buildDatasetItemFilter
} from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import { DatasetItemFilter, DatasetPayload, LoadingStatus } from '@/store/types'
import { errorsByCode } from '@/utils'

import NewFolderContextMenuItem from './NewFolderContextMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let dataset: DatasetPayload

const folders = [
  buildDatasetFolderPayload({ path: '/', direct_item_count_filtered: 1 }),
  buildDatasetFolderPayload({ path: '/test', direct_item_count_filtered: 2 })
]
const mocks = { $route: { name: 'DatasetManagementData' } }
const stubs: Stubs = {
  FolderPopover: {
    template: '<div class="folder-popover"><slot /></div>'
  }
}

let propsData: {
  dataset: DatasetPayload,
  filter: DatasetItemFilter
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  dataset = buildDatasetPayload({ id: 1, name: 'Test' })
  propsData = { dataset, filter: buildDatasetItemFilter({}) }
  store = createTestStore()
  store.commit('dataset/SET_DATASET_FOLDERS', {
    datasetId: dataset.id,
    folders
  })
})

it('matches snapshot', () => {
  const wrapper = shallowMount(NewFolderContextMenuItem, {
    localVue, mocks, propsData, store, stubs
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loading is true', () => {
  store.commit('loading/SET_ACTION_LOADING_STATUS', {
    key: 'dataset/loadDatasetFolders',
    status: LoadingStatus.Loading
  })
  const wrapper = shallowMount(NewFolderContextMenuItem, {
    localVue, mocks, propsData, store, stubs
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when video page', () => {
  const mocks = { $route: { name: 'DatasetManagementVideo' } }
  const wrapper = shallowMount(NewFolderContextMenuItem, {
    localVue, mocks, propsData, store, stubs
  })
  expect(wrapper).toMatchSnapshot()
})

it('dispatches store action on move', async () => {
  const wrapper = shallowMount(NewFolderContextMenuItem, {
    localVue, mocks, propsData, store, stubs
  })

  await emitRootStub(wrapper, 'move', '/folder')
  expect(store.dispatch).toHaveBeenCalledWith('dataset/moveItemsToPath', {
    dataset: propsData.dataset,
    filter: propsData.filter,
    path: '/folder'
  })
})

it('triggers warning toast when you click on the button in video page', async () => {
  const mocks = { $route: { name: 'DatasetManagementVideo' } }
  store.commit('loading/SET_ACTION_LOADING_STATUS', {
    key: 'dataset/loadDatasetFolders',
    status: LoadingStatus.Loading
  })
  const wrapper = shallowMount(NewFolderContextMenuItem, {
    localVue, mocks, propsData, store, stubs
  })
  await wrapper.find('gallery-context-menu-item-stub').vm.$emit('click')
  expect(store.dispatch).toBeCalledWith('toast/warning', {
    content: errorsByCode.WORKFLOW_CANNOT_MOVE_VIDEO_TO_FOLDER
  })
})
