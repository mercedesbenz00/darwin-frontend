import { buildAxiosResponse, createFile } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { setV2FilesToUpload } from '@/utils/backend/index'

mockApi()

let backend: jest.SpyInstance
let payload: Parameters<typeof setV2FilesToUpload>[0]

beforeEach(() => {
  const file = createFile('filename.png')

  payload = {
    items: [{
      file_name: file.name,
      slot_name: '0',
      type: file.type,
      fps: 5,
      as_frames: false
    }],
    tags: ['tag'],
    path: '',
    teamSlug: 'v7',
    datasetSlug: 'dataset'
  }

  backend = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: payload }))
})

afterEach(() => {
  backend.mockReset()
})

it('sends request to backend', async () => {
  await setV2FilesToUpload(payload)
  expect(backend).toHaveBeenCalledWith('v2/teams/v7/items/register_upload', {
    dataset_slug: 'dataset',
    items: [{
      slots: [{
        as_frames: false,
        tags: ['tag'],
        file_name: 'filename.png',
        fps: 5,
        slot_name: '0'
      }],
      name: 'filename.png',
      layout: null,
      path: '',
      tags: ['tag']
    }]
  })
})

it('returns response from backend', async () => {
  const response = await setV2FilesToUpload(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  backend.mockRejectedValue(backendUnauthenticatedError)

  const response = await setV2FilesToUpload(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_UPDATE[401],
      status: 401
    })
  })
})
