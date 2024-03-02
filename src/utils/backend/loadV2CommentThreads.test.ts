import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadV2CommentThreads } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance
let payload: Parameters<typeof loadV2CommentThreads>[0]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests from backend', async () => {
  await loadV2CommentThreads(payload)
  expect(apiGet).toHaveBeenCalledWith('v2/teams/v7/items/fake-item-id/comment_threads')
})

it('returns response from backend', async () => {
  const response = await loadV2CommentThreads(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadV2CommentThreads(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_THREADS_LOAD[401],
      status: 401
    })
  })
})
