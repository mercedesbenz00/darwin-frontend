import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetFolderPayload } from 'test/unit/factories'

import { DatasetFolderPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let folders: DatasetFolderPayload[]

const MUTATION = 'dataset/SET_DATASET_FOLDERS'

beforeEach(() => {
  store = createTestStore()
})

it('pushes treefied/non-treefied folders to store', () => {
  folders = [
    buildDatasetFolderPayload({ path: '/', direct_item_count_filtered: 1 }),
    buildDatasetFolderPayload({ path: '/root', direct_item_count_filtered: 2 })
  ]

  store.commit(MUTATION, { folders })
  expect(store.state.dataset.datasetFolders).toEqual(folders)
  expect(store.state.dataset.datasetTreefiedFolders).toEqual([{
    ...folders[0],
    children: [folders[1]]
  }])
})
