import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { UploadFileData } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const createFile = (name: string): File => new File([''], name, { type: 'image/png' })

beforeEach(() => {
  store = createUnstubbedTestStore()
})

it('removes files from store', async () => {
  const files = ['a', 'b'].map(createFile)
  store.commit('datasetUpload/ADD_FILES', files)

  expect(store.state.datasetUpload.files.length).toEqual(2)
  await store.dispatch('datasetUpload/removeFiles', store.state.datasetUpload.files)
  expect(store.state.datasetUpload.files).toEqual([])
})

it('sends request to remove sets from backend if files have been persisted', async () => {
  const files = ['foo', 'bar'].map(createFile)

  store.commit('datasetUpload/SET_DATASET_ID', 1)
  store.commit('datasetUpload/ADD_FILES', files)

  const [uploadFile1, uploadFile2] = store.state.datasetUpload.files
  const data1: Partial<UploadFileData> = { dataURL: '1' }
  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile: uploadFile1, data: data1 })
  const data2: Partial<UploadFileData> = { dataURL: '2' }
  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile: uploadFile2, data: data2 })

  await store.dispatch('datasetUpload/removeFiles', [uploadFile1, uploadFile2])

  expect(store.state.datasetUpload.files).toEqual([])
})
