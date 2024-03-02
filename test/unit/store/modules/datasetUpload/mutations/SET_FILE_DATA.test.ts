import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { createFile } from 'test/unit/factories'

import { UploadFileData } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const files = [1, 2, 3].map(i => i.toString()).map((val) => createFile(val))

beforeEach(() => {
  store = createTestStore()
})

it('sets data for specified uploadFile', () => {
  store.commit('datasetUpload/ADD_FILES', files)
  const data: Partial<UploadFileData> = { framerate: 5, duration: 10 }
  const uploadFile = store.state.datasetUpload.files[0]
  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data })
  expect(store.state.datasetUpload.files[0].data.framerate).toEqual(5)
  expect(store.state.datasetUpload.files[0].data.duration).toEqual(10)
})
