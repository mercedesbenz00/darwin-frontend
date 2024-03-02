import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { archiveV2Items } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance
let payload: Parameters<typeof archiveV2Items>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: payload }))
  payload = {
    teamSlug: 'v7',
    filters: { item_ids: ['1', '6', '9'] }
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await archiveV2Items(payload)
  expect(apiPost).toHaveBeenCalledWith(`v2/teams/${payload.teamSlug}/items/archive`, {
    filters: { item_ids: ['1', '6', '9'] }
  })
})

it('returns response from backend', async () => {
  const response = await archiveV2Items(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await archiveV2Items(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_IMAGE_DELETE[401],
      status: 401
    })
  })
})
