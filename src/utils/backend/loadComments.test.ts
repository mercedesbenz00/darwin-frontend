import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadComments } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance
let payload: Parameters<typeof loadComments>[0]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    threadId: 1
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests from backend', async () => {
  await loadComments(payload)
  expect(apiGet).toHaveBeenCalledWith('workflow_comment_threads/1/workflow_comments')
})

it('returns response from backend', async () => {
  const response = await loadComments(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadComments(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENTS_FOR_THREAD_LOAD[401],
      status: 401
    })
  })
})
