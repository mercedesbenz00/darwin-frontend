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

it('returns thumbs for file data if they exists', async () => {
  const uploadFile = createUploadFile('foo', { thumbs: ['a', 'b', 'c'] })
  await store.dispatch('datasetUpload/getVideoInfo', uploadFile)
  expect(uploadFile.data.thumbs).toEqual(['a', 'b', 'c'])
})

it('loads info from file if not present, sets frames and duration to file', async () => {
  jest.spyOn(FileUtils, 'loadVideo').mockResolvedValue({ frames: ['d', 'e', 'f'], duration: 5 })

  const uploadFile = createUploadFile()
  await store.dispatch('datasetUpload/getVideoInfo', uploadFile)
  expect(uploadFile.data.thumbs).toEqual(['d', 'e', 'f'])
  expect(uploadFile.data.duration).toEqual(5)
})
