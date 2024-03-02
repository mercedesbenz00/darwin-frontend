import { shallowMount, createLocalVue, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetFolderPayload, buildDatasetPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import WorkflowFolderDisplay from '@/components/WorkView/WorkflowFilter/WorkflowFolderDisplay.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs: Stubs = { 'router-link': true, VPopover }
let propsData: {
  dataset: DatasetPayload
}
let store: ReturnType<typeof createTestStore>

const folder2 = buildDatasetFolderPayload({ path: '/test1/test2', direct_item_count_filtered: 10 })
const folder1 = buildDatasetFolderPayload({ path: '/test1', children: [folder2], direct_item_count_filtered: 10 })
const rootFolder = buildDatasetFolderPayload({ path: '/', children: [folder1], direct_item_count_filtered: 10 })

const mocks = {
  $route: { query: { path: '/test1/test2' } },
  $router: { push: jest.fn() }
}

beforeEach(() => {
  store = createTestStore()
  store.commit(
    'workview/SET_DATASET_FOLDERS',
    {
      folders: [rootFolder, folder1, folder2],
      datasetId: -1
    }
  )
  propsData = {
    dataset: buildDatasetPayload({ name: 'SFH' })
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowFolderDisplay, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('pushes new route when folder is selected', async () => {
  const wrapper = shallowMount(WorkflowFolderDisplay, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('folder-tree-stub').vm.$emit('select', folder1)
  expect(mocks.$router.push).toBeCalledWith({
    path: '/workview',
    query: { path: '/test1' }
  })
})
