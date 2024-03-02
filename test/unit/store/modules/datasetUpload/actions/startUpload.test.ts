import { createLocalVue } from '@vue/test-utils'
import { v4 as uuidv4 } from 'uuid'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import * as UrlSigner from '@/components/Dataset/DropZone/urlsigner'

jest.mock('@/components/Dataset/DropZone/fileUtils')

const createFile = (name?: string): File => new File([''], name || uuidv4(), { type: 'image/png' })

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>
let signFile: jest.SpyInstance
let sendFile: jest.SpyInstance
let mockDispatch: jest.Mock

beforeEach(() => {
  signFile = jest.spyOn(UrlSigner, 'signFile').mockResolvedValue({ uploadUrl: 'foo' })
  sendFile = jest.spyOn(UrlSigner, 'sendFile').mockResolvedValue({ success: true })
  store = createUnstubbedTestStore()
  const { dispatch } = store

  mockDispatch = jest.fn()
    .mockImplementation((action: string, payload: any, opts: any) => {
      const allowed = ['datasetUpload/startUpload']
      if (allowed.includes(action)) {
        return payload ? dispatch(action, payload, opts) : dispatch(action)
      }
      return Promise.resolve({ data: {} })
    })

  store.dispatch = mockDispatch
})

afterEach(() => {
  sendFile.mockClear()
  signFile.mockClear()
})

it('sets upload status to "started"', async () => {
  await store.dispatch('datasetUpload/startUpload')
  expect(store.state.datasetUpload.status).toEqual('started')
})

it('processes queued files in chunks of 5', async () => {
  const files = [0, 1, 2, 3, 4, 5].map(i => i.toString()).map(createFile)
  store.commit('datasetUpload/ADD_FILES', files)
  store.commit('datasetUpload/SET_FILE_DATA', {
    uploadFile: store.state.datasetUpload.files[0],
    data: { status: 'queued' }
  })
  await store.dispatch('datasetUpload/startUpload')

  expect(store.dispatch).toHaveBeenCalledWith('datasetUpload/continuouslyUploadChunks', undefined)
})
