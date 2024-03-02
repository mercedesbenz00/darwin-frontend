import { buildCommentPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { deleteComment } from '.'

mockApi()

let apiDelete: jest.SpyInstance

let payload: Parameters<typeof deleteComment>[0]
const comment = buildCommentPayload()

beforeEach(() => {
  apiDelete = jest
    .spyOn(api, 'remove')
    .mockResolvedValue(buildAxiosResponse({ data: comment }))
  payload = {
    id: 3
  }
})

afterEach(() => {
  apiDelete.mockReset()
})

it('sends request to backend', async () => {
  await deleteComment(payload)
  expect(apiDelete).toHaveBeenCalledWith('workflow_comments/3')
})

it('returns response from backend', async () => {
  const response = await deleteComment(payload)
  expect(response).toEqual(expect.objectContaining({ data: comment }))
})

it('parses and returns error on backend error', async () => {
  apiDelete.mockRejectedValue(backendUnauthenticatedError)

  const response = await deleteComment(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_FOR_THREAD_DELETE[401],
      status: 401
    })
  })
})
