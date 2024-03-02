import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadCommentThreads } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance
let payload: Parameters<typeof loadCommentThreads>[0]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    workflowId: 1
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests from backend', async () => {
  await loadCommentThreads(payload)
  expect(apiGet).toHaveBeenCalledWith('workflows/1/workflow_comment_threads')
})

it('returns response from backend', async () => {
  const response = await loadCommentThreads(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadCommentThreads(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_THREADS_LOAD[401],
      status: 401
    })
  })
})
