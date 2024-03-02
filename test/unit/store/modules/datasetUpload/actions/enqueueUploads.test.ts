import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { FileStatus, UploadFile } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const createFile = (name: string): File => new File([''], name, { type: 'image/png' })
const setStatus =
  (uploadFile: UploadFile, status: FileStatus): void =>
    store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { status } })

beforeEach(() => {
  store = createUnstubbedTestStore()
})
it('marks "added" files as "queued"', async () => {
  store.commit('datasetUpload/ADD_FILES', [createFile('foo'), createFile('bar')])

  await store.dispatch('datasetUpload/enqueueUploads')

  const state = store.state.datasetUpload
  expect(state.files.length).toEqual(2)
  expect(state.files[0].data.status).toEqual('queued')
  expect(state.files[1].data.status).toEqual('queued')
})

it('marks a maximum of 5 files', async () => {
  const files = []
  for (let i = 0; i < 6; i++) {
    files.push(createFile(`${i}`))
  }

  store.commit('datasetUpload/ADD_FILES', files)

  await store.dispatch('datasetUpload/enqueueUploads')

  const state = store.state.datasetUpload
  expect(state.files.length).toEqual(6)
  expect(state.files[0].data.status).toEqual('queued')
  expect(state.files[1].data.status).toEqual('queued')
  expect(state.files[2].data.status).toEqual('queued')
  expect(state.files[3].data.status).toEqual('queued')
  expect(state.files[4].data.status).toEqual('queued')
  expect(state.files[5].data.status).toEqual('added')
})

it('marks less files if some are already processing', async () => {
  const files = [1, 2, 4, 5, 6, 7].map(i => i.toString()).map(createFile)

  store.commit('datasetUpload/ADD_FILES', files)
  const state = store.state.datasetUpload

  setStatus(state.files[1], 'queued')
  setStatus(state.files[2], 'signing')
  setStatus(state.files[3], 'uploading')
  setStatus(state.files[4], 'reporting')
  setStatus(state.files[5], 'added')

  await store.dispatch('datasetUpload/enqueueUploads')

  expect(state.files[0].data.status).toEqual('queued')
  expect(state.files[1].data.status).toEqual('queued')
  expect(state.files[2].data.status).toEqual('signing')
  expect(state.files[3].data.status).toEqual('uploading')
  expect(state.files[4].data.status).toEqual('reporting')
  expect(state.files[5].data.status).toEqual('queued')
})
