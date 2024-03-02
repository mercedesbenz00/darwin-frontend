import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import { createFile } from 'test/unit/factories'

import * as UrlSigner from '@/components/Dataset/DropZone/urlsigner'
import { FileStatus, UploadFile, UploadFileData } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof initializeStore>

let files: File[]
let fileData: Partial<UploadFileData>
let signFile: jest.SpyInstance
let sendFile: jest.SpyInstance

beforeEach(() => {
  signFile = jest.spyOn(UrlSigner, 'signFile')
    .mockResolvedValue({ uploadUrl: 'foo' })
  sendFile = jest.spyOn(UrlSigner, 'sendFile').mockResolvedValue({ success: true })

  store = initializeStore()
  const { dispatch } = store

  store.dispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (action === 'datasetUpload/processUploadQueue') {
      return dispatch(action, payload, opts)
    } else {
      return Promise.resolve({ data: {} })
    }
  })

  files = [createFile('a')]
  store.commit('datasetUpload/ADD_FILES', files)

  fileData = {
    datasetItemId: 2,
    signingURL: 'b-signing-url',
    status: 'queued'
  }
  store.commit('datasetUpload/SET_FILE_DATA', {
    uploadFile: store.state.datasetUpload.files[0],
    data: fileData
  })
})

afterEach(() => {
  sendFile.mockClear()
  signFile.mockClear()
})

const setStatus = (
  uploadFile: UploadFile,
  status: FileStatus
): void => store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { status } })

it('processes queued files', async () => {
  const signResponse = { uploadUrl: 'foo' }
  const signFile = jest.spyOn(UrlSigner, 'signFile').mockResolvedValue(signResponse)
  const sendFile = jest.spyOn(UrlSigner, 'sendFile').mockResolvedValue({ success: true })

  await store.dispatch('datasetUpload/processUploadQueue')

  expect(signFile).toHaveBeenCalledTimes(1)
  expect(signFile).toHaveBeenCalledWith(expect.any(File), { signingURL: 'b-signing-url' })

  expect(sendFile).toHaveBeenCalledTimes(1)
  expect(sendFile).toHaveBeenCalledWith(expect.any(File), {
    uploadUrl: 'foo',
    onProgress: expect.any(Function)
  })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/confirmFileUpload', {
    datasetItemId: 2
  })

  expect(store.state.datasetUpload.files[0].data.status).toEqual('uploaded-reported')

  signFile.mockClear()
  sendFile.mockClear()
})

it('sets final file status', async () => {
  setStatus(store.state.datasetUpload.files[0], 'queued')

  await store.dispatch('datasetUpload/processUploadQueue')

  expect(store.state.datasetUpload.files[0].data.status).toEqual('uploaded-reported')

  signFile.mockClear()
  sendFile.mockClear()
})

it('sets status as error-signing if signing failed', async () => {
  jest.spyOn(UrlSigner, 'signFile').mockRejectedValue(null)
  setStatus(store.state.datasetUpload.files[0], 'queued')

  await store.dispatch('datasetUpload/processUploadQueue')
  expect(store.state.datasetUpload.files[0].data.status).toEqual('error-signing')
})

it('sets status as error-uploading if upload failed', async () => {
  sendFile.mockRejectedValue({})
  setStatus(store.state.datasetUpload.files[0], 'queued')

  await store.dispatch('datasetUpload/processUploadQueue')
  expect(store.state.datasetUpload.files[0].data.status).toEqual('error-uploading')
})

it('sets status as error-reporting if report failed', async () => {
  const { dispatch } = store

  store.dispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (action === 'datasetUpload/processUploadQueue') {
      return dispatch(action, payload, opts)
    } else if (action === 'dataset/confirmFileUpload') {
      return Promise.resolve({ error: {} })
    } else {
      return Promise.resolve({ data: {} })
    }
  })

  setStatus(store.state.datasetUpload.files[0], 'queued')

  await store.dispatch('datasetUpload/processUploadQueue')
  await flushPromises()

  expect(store.state.datasetUpload.files[0].data.status).toEqual('error-reporting')
})
