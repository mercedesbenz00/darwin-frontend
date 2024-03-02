import { buildCommentPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { updateComment } from '.'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof updateComment>[0]
const comment = buildCommentPayload()

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: comment }))
  payload = {
    body: 'New body',
    id: 5
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await updateComment(payload)
  expect(apiPut).toHaveBeenCalledWith('workflow_comments/5', { body: 'New body' })
})

it('returns response from backend', async () => {
  const response = await updateComment(payload)
  expect(response).toEqual(expect.objectContaining({ data: comment }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateComment(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.COMMENT_FOR_THREAD_UPDATE[401],
      status: 401
    })
  })
})
