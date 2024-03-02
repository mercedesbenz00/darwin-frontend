import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetFolderPayload, buildDatasetPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import FileSetFolderButton from '@/components/Dataset/DropZone/FileSet/FileSetFolderButton.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createTestStore>

let dataset: DatasetPayload
let propsData: {
  dataset: DatasetPayload
}
const stubs: Stubs = {
  FolderPopover: {
    template: '<div class="folder-popover"><slot /></div>'
  }
}

beforeEach(() => {
  store = createTestStore()
  dataset = buildDatasetPayload({ id: 1 })
  store.commit('dataset/SET_DATASET_FOLDERS', {
    folders: [
      buildDatasetFolderPayload({ path: '/' }),
      buildDatasetFolderPayload({ path: '/root' })
    ],
    datasetId: dataset.id
  })
  propsData = {
    dataset
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(FileSetFolderButton, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('should load folders when mounted', () => {
  shallowMount(FileSetFolderButton, { localVue, propsData, store, stubs })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/loadDatasetFoldersThrottled', {
    datasetId: dataset.id
  })
})

it('should emit "set-folder" when folder is selected', async () => {
  const wrapper = shallowMount(FileSetFolderButton, { localVue, propsData, store, stubs })
  await emitRootStub(wrapper, 'move', '/root')
  expect(wrapper.emitted()['set-folder']).toEqual([['/root']])
})
