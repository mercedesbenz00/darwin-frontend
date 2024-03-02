import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api } from '@/utils'
import { createUploadInfo } from '@/utils/backend'
import { DEFAULT_ERROR } from '@/utils/error/errors'

mockApi()

let apiPost: jest.SpyInstance

let params: Parameters<typeof createUploadInfo>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: {} }))
  params = {
    teamSlug: 'v7',
    type: 'annotation_class'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend with email', async () => {
  await createUploadInfo(params)
  expect(apiPost).toHaveBeenCalledWith('teams/v7/upload_info', {
    type: 'annotation_class'
  })
})

it('returns response from backend', async () => {
  const response = await createUploadInfo(params)
  expect(response).toEqual(buildAxiosResponse({ data: {} }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createUploadInfo(params)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: DEFAULT_ERROR,
      status: 401
    })
  })
})
