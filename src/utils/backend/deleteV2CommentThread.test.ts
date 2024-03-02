import { buildV2CommentThreadPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { deleteV2CommentThread } from '.'

mockApi()

let apiDelete: jest.SpyInstance

let payload: Parameters<typeof deleteV2CommentThread>[0]
const commentThread = buildV2CommentThreadPayload()

beforeEach(() => {
  apiDelete = jest
    .spyOn(api, 'remove')
    .mockResolvedValue(buildAxiosResponse({ data: commentThread }))
  payload = {
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7',
    threadId: 'fake-thread-id'
  }
})

afterEach(() => {
  apiDelete.mockReset()
})

it('sends request to backend', async () => {
  await deleteV2CommentThread(payload)
  expect(apiDelete)
    .toHaveBeenCalledWith('v2/teams/v7/items/fake-item-id/comment_threads/fake-thread-id')
})

it('returns response from backend', async () => {
  const response = await deleteV2CommentThread(payload)
  expect(response).toEqual(expect.objectContaining({ data: commentThread }))
})

it('parses and returns error on backend error', async () => {
  apiDelete.mockRejectedValue(backendUnauthenticatedError)

  const response = await deleteV2CommentThread(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_THREAD_DELETE[401],
      status: 401
    })
  })
})
