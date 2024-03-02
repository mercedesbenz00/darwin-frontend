import { buildV2CommentThreadPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { createV2CommentThread } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof createV2CommentThread>[0]
const commentThread = buildV2CommentThreadPayload()
const response = buildAxiosResponse({ data: commentThread })

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(response)
  payload = {
    boundingBox: { x: 0, y: 0, w: 100, h: 100 },
    comments: [{ body: 'Test Comment' }],
    datasetItemId: 'foo-item-id',
    sectionIndex: 10,
    slotName: 'foo-slot',
    teamSlug: 'v7'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await createV2CommentThread(payload)
  expect(apiPost).toHaveBeenCalledWith('v2/teams/v7/items/foo-item-id/comment_threads', {
    bounding_box: { x: 0, y: 0, w: 100, h: 100 },
    comments: [{ body: 'Test Comment' }],
    section_index: 10,
    slot_name: 'foo-slot'
  })
})

it('returns response from backend', async () => {
  const response = await createV2CommentThread(payload)
  expect(response).toEqual(expect.objectContaining({ data: commentThread }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createV2CommentThread(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_THREAD_CREATE[401],
      status: 401
    })
  })
})
