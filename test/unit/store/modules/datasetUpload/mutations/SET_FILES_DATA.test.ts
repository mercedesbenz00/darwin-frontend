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

it('sets data for specified uploadFiles, leaves unpspecified unchanged', () => {
  store.commit('datasetUpload/ADD_FILES', files)
  const [uploadFile1, uploadFile2, uploadFile3] = store.state.datasetUpload.files

  store.commit('datasetUpload/SET_FILES_DATA', [
    { uploadFile: uploadFile1, data: { framerate: 5, duration: 10 } },
    { uploadFile: uploadFile2, data: { framerate: 50, duration: 15 } }
  ])
  expect(store.state.datasetUpload.files[0].data.framerate).toEqual(5)
  expect(store.state.datasetUpload.files[0].data.duration).toEqual(10)
  expect(store.state.datasetUpload.files[1].data.framerate).toEqual(50)
  expect(store.state.datasetUpload.files[1].data.duration).toEqual(15)
  expect(store.state.datasetUpload.files[2]).toEqual(uploadFile3)
})
