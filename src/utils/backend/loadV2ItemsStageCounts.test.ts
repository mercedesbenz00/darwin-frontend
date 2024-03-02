import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { loadV2ItemsStageCounts } from './loadV2ItemsStageCounts'

mockApi()

let apiGet: jest.SpyInstance
let payload: Parameters<typeof loadV2ItemsStageCounts>[0]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'getV2').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'v7',
    filters: {
      item_ids: ['1', '6', '9']
    }
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('sends request to backend', async () => {
  await loadV2ItemsStageCounts(payload)
  expect(apiGet).toHaveBeenCalledWith(`v2/teams/${payload.teamSlug}/items/stage_counts`, {
    item_ids: ['1', '6', '9']
  })
})

it('returns response from backend', async () => {
  const response = await loadV2ItemsStageCounts(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadV2ItemsStageCounts(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.WORKVIEW_IMAGES_LOAD[401],
      status: 401
    })
  })
})
