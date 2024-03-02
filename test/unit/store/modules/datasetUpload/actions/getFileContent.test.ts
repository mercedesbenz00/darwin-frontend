import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { createFile } from 'test/unit/factories'

import * as FileUtils from '@/components/Dataset/DropZone/fileUtils'
import { UploadFile, UploadFileData } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const createUploadFile = (name?: string, data?: Partial<UploadFileData>): UploadFile => ({
  file: createFile(name),
  data: data || { status: 'added', category: 'image' }
}) as UploadFile

beforeEach(() => {
  store = createUnstubbedTestStore()
})

it('returns dataURL for file if it exists', async () => {
  const uploadFile = createUploadFile('foo', { dataURL: 'bar' })
  await store.dispatch('datasetUpload/getFileContent', uploadFile)
  expect(uploadFile.data.dataURL).toEqual('bar')
})

it('loads dataURL from file if not present', async () => {
  jest.spyOn(FileUtils, 'loadFileContent').mockResolvedValue('bat')

  const uploadFile = createUploadFile()
  await store.dispatch('datasetUpload/getFileContent', uploadFile)
  expect(uploadFile.data.dataURL).toEqual('bat')
})
