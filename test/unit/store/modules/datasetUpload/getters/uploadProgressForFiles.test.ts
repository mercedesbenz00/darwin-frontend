import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { createFile } from 'test/unit/factories'

import { UploadFile, UploadFileData } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

const defaultFileData: UploadFileData = {
  status: 'added',
  category: 'image',
  setId: 1,
  signingURL: '',
  sentBytes: 0,
  totalBytes: 1000
}

const erroredFile: UploadFile = {
  file: createFile('errored.png'),
  data: { ...defaultFileData, status: 'error-uploading' }
}

const file90: UploadFile = {
  file: createFile('90.png'),
  data: { ...defaultFileData, status: 'uploading', sentBytes: 900 }
}

const file50: UploadFile = {
  file: createFile('90.png'),
  data: { ...defaultFileData, status: 'uploading', sentBytes: 500 }
}

it('reports errored files as done', () => {
  expect(store.getters['datasetUpload/uploadProgressForFiles']([erroredFile])).toEqual(100)
})

it('reports average of sent vs total bytes', () => {
  expect(store.getters['datasetUpload/uploadProgressForFiles']([file90, file50])).toEqual(70)
})
