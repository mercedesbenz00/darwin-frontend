import { buildV2CommentPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { createV2Comment } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof createV2Comment>[0]
const comment = buildV2CommentPayload()
const response = buildAxiosResponse({ data: comment })

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(response)
  payload = {
    body: 'This is a comment',
    datasetItemId: 'foo-item-id',
    teamSlug: 'v7',
    threadId: 'fake-thread-id'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await createV2Comment(payload)
  expect(apiPost).toHaveBeenCalledWith(
    'v2/teams/v7/items/foo-item-id/comment_threads/fake-thread-id/comments', {
      body: 'This is a comment'
    })
})

it('returns response from backend', async () => {
  const response = await createV2Comment(payload)
  expect(response).toEqual(expect.objectContaining({ data: comment }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createV2Comment(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_FOR_THREAD_CREATE[401],
      status: 401
    })
  })
})
