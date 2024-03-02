import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { deleteV2Items } from '@/utils/backend'

mockApi()

let apiRemove: jest.SpyInstance
let payload: Parameters<typeof deleteV2Items>[0]

beforeEach(() => {
  apiRemove = jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'v7',
    filters: { item_ids: ['1', '6', '9'] }
  }
})

afterEach(() => {
  apiRemove.mockReset()
})

it('sends request to backend', async () => {
  await deleteV2Items(payload)
  expect(apiRemove).toHaveBeenCalledWith(`v2/teams/${payload.teamSlug}/items`, {
    filters: { item_ids: ['1', '6', '9'] }
  })
})

it('returns response from backend', async () => {
  const response = await deleteV2Items(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiRemove.mockRejectedValue(backendUnauthenticatedError)

  const response = await deleteV2Items(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_IMAGE_DELETE[401],
      status: 401
    })
  })
})
