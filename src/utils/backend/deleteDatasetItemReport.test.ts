import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { deleteDatasetItemReport } from '@/utils/backend'

mockApi()

let apiRemove: jest.SpyInstance
let payload: Parameters<typeof deleteDatasetItemReport>[0]

beforeEach(() => {
  apiRemove = jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'team_slug',
    datasetSlug: 'dataset_slug',
    reportId: 'report_id'
  }
})

afterEach(() => {
  apiRemove.mockReset()
})

it('sends to backend', async () => {
  await deleteDatasetItemReport(payload)
  expect(apiRemove).toHaveBeenCalledWith('teams/team_slug/dataset_slug/item_reports/report_id')
})

it('returns response from backend', async () => {
  const response = await deleteDatasetItemReport(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiRemove.mockRejectedValue(backendUnauthenticatedError)

  const response = await deleteDatasetItemReport(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEM_REPORT_DELETE[401],
      status: 401
    })
  })
})
