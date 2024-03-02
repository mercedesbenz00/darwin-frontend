import { buildCommentThreadPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { deleteCommentThread } from '.'

mockApi()

let apiDelete: jest.SpyInstance

let payload: Parameters<typeof deleteCommentThread>[0]
const commentThread = buildCommentThreadPayload()

beforeEach(() => {
  apiDelete = jest
    .spyOn(api, 'remove')
    .mockResolvedValue(buildAxiosResponse({ data: commentThread }))
  payload = {
    threadId: 3
  }
})

afterEach(() => {
  apiDelete.mockReset()
})

it('sends request to backend', async () => {
  await deleteCommentThread(payload)
  expect(apiDelete).toHaveBeenCalledWith('workflow_comment_threads/3')
})

it('returns response from backend', async () => {
  const response = await deleteCommentThread(payload)
  expect(response).toEqual(expect.objectContaining({ data: commentThread }))
})

it('parses and returns error on backend error', async () => {
  apiDelete.mockRejectedValue(backendUnauthenticatedError)

  const response = await deleteCommentThread(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_THREAD_DELETE[401],
      status: 401
    })
  })
})
