import { buildCommentThreadPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { createCommentThread } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof createCommentThread>[0]
const commentThread = buildCommentThreadPayload()

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: commentThread }))
  payload = {
    boundingBox: { x: 0, y: 0, w: 100, h: 100 },
    frameIndex: 10,
    comments: [{ body: 'Test Comment' }],
    workflowId: 1
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await createCommentThread(payload)
  expect(apiPost).toHaveBeenCalledWith('workflows/1/workflow_comment_threads', {
    bounding_box: { x: 0, y: 0, w: 100, h: 100 },
    frame_index: 10,
    workflow_comments: [{ body: 'Test Comment' }]
  })
})

it('returns response from backend', async () => {
  const response = await createCommentThread(payload)
  expect(response).toEqual(expect.objectContaining({ data: commentThread }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createCommentThread(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_THREAD_CREATE[401],
      status: 401
    })
  })
})
