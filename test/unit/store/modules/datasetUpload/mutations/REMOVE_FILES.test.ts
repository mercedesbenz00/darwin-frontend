import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { createFile } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const files = [1, 2, 3].map(i => i.toString()).map((val) => createFile(val))

beforeEach(() => {
  store = createTestStore()
})

it('removes specified files', () => {
  store.commit('datasetUpload/ADD_FILES', files)
  const [uploadFile1, uploadFile2, uploadFile3] = store.state.datasetUpload.files
  expect(store.state.datasetUpload.files.length).toEqual(3)
  store.commit('datasetUpload/REMOVE_FILES', [uploadFile1])
  expect(store.state.datasetUpload.files.length).toEqual(2)
  store.commit('datasetUpload/REMOVE_FILES', [uploadFile2, uploadFile3])
  expect(store.state.datasetUpload.files).toEqual([])
})

it('does nothing if file is not in state', () => {
  store.commit('datasetUpload/ADD_FILES', files)
  expect(store.state.datasetUpload.files.length).toEqual(3)
  const file = store.state.datasetUpload.files[0]
  store.commit('datasetUpload/REMOVE_FILES', [file])
  expect(store.state.datasetUpload.files.length).toEqual(2)
  store.commit('datasetUpload/REMOVE_FILES', [file])
  expect(store.state.datasetUpload.files.length).toEqual(2)
})
