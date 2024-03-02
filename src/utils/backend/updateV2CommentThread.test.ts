import { buildV2CommentThreadPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { updateV2CommentThread } from '.'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof updateV2CommentThread>[0]
const commentThread = buildV2CommentThreadPayload()

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: commentThread }))
  payload = {
    boundingBox: { x: 0, y: 0, w: 100, h: 100 },
    resolved: true,
    teamSlug: 'v7',
    datasetItemId: 'fake-item-id',
    threadId: 'fake-thread-id'
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await updateV2CommentThread(payload)
  expect(apiPut).toHaveBeenCalledWith(
    'v2/teams/v7/items/fake-item-id/comment_threads/fake-thread-id', {
      bounding_box: { x: 0, y: 0, w: 100, h: 100 },
      resolved: true
    })
})

it('returns response from backend', async () => {
  const response = await updateV2CommentThread(payload)
  expect(response).toEqual(expect.objectContaining({ data: commentThread }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateV2CommentThread(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_THREAD_UPDATE[401],
      status: 401
    })
  })
})
