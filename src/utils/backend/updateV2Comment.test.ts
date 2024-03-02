import { buildV2CommentPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { updateV2Comment } from '.'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof updateV2Comment>[0]
const comment = buildV2CommentPayload()

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: comment }))
  payload = {
    body: 'New body',
    commentId: 'fake-comment-id',
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7',
    threadId: 'fake-thread-id'
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await updateV2Comment(payload)
  expect(apiPut).toHaveBeenCalledWith(
    'v2/teams/v7/items/fake-item-id/comment_threads/fake-thread-id/comments/fake-comment-id', {
      body: 'New body'
    })
})

it('returns response from backend', async () => {
  const response = await updateV2Comment(payload)
  expect(response).toEqual(expect.objectContaining({ data: comment }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateV2Comment(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_FOR_THREAD_UPDATE[401],
      status: 401
    })
  })
})
