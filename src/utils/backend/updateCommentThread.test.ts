import { buildCommentThreadPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { updateCommentThread } from '.'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof updateCommentThread>[0]
const commentThread = buildCommentThreadPayload()

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: commentThread }))
  payload = {
    boundingBox: { x: 0, y: 0, w: 100, h: 100 },
    resolved: true,
    threadId: 3
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await updateCommentThread(payload)
  expect(apiPut).toHaveBeenCalledWith('workflow_comment_threads/3', {
    bounding_box: { x: 0, y: 0, w: 100, h: 100 },
    resolved: true
  })
})

it('returns response from backend', async () => {
  const response = await updateCommentThread(payload)
  expect(response).toEqual(expect.objectContaining({ data: commentThread }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateCommentThread(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_THREAD_UPDATE[401],
      status: 401
    })
  })
})
