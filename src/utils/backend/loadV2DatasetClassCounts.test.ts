import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadV2DatasetClassCounts } from '@/utils/backend'

mockApi()

let apiRemove: jest.SpyInstance
let payload: Parameters<typeof loadV2DatasetClassCounts>[0]

beforeEach(() => {
  apiRemove = jest.spyOn(api, 'getV2').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'v7',
    item_ids: ['1', '6', '9']
  }
})

afterEach(() => {
  apiRemove.mockReset()
})

it('sends request to backend', async () => {
  await loadV2DatasetClassCounts(payload)
  expect(apiRemove).toHaveBeenCalledWith(`v2/teams/${payload.teamSlug}/items/class_counts`, {
    item_ids: ['1', '6', '9']
  })
})

it('returns response from backend', async () => {
  const response = await loadV2DatasetClassCounts(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiRemove.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadV2DatasetClassCounts(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.WORKVIEW_IMAGES_LOAD[401],
      status: 401
    })
  })
})