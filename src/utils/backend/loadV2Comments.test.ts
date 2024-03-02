import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadV2Comments } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance
let payload: Parameters<typeof loadV2Comments>[0]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7',
    threadId: 'fake-thread-id'
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests from backend', async () => {
  await loadV2Comments(payload)
  expect(apiGet).toHaveBeenCalledWith(
    'v2/teams/v7/items/fake-item-id/comment_threads/fake-thread-id/comments'
  )
})

it('returns response from backend', async () => {
  const response = await loadV2Comments(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadV2Comments(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENTS_FOR_THREAD_LOAD[401],
      status: 401
    })
  })
})
