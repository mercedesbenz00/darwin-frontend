import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadDatasetItemReports } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance
let payload: Parameters<typeof loadDatasetItemReports>[0]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'team_slug',
    datasetSlug: 'dataset_slug'
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests from backend', async () => {
  await loadDatasetItemReports(payload)
  expect(apiGet).toHaveBeenCalledWith('teams/team_slug/dataset_slug/item_reports')
})

it('returns response from backend', async () => {
  const response = await loadDatasetItemReports(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadDatasetItemReports(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEM_REPORT_LOAD[401],
      status: 401
    })
  })
})
