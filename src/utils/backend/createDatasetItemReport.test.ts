import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { createDatasetItemReport } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance
let payload: Parameters<typeof createDatasetItemReport>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: {} }))
  payload = {
    teamSlug: 'team_slug',
    datasetSlug: 'dataset_slug'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('requests from backend', async () => {
  await createDatasetItemReport(payload)
  expect(apiPost).toHaveBeenCalledWith('teams/team_slug/dataset_slug/item_reports')
})

it('returns response from backend', async () => {
  const response = await createDatasetItemReport(payload)
  expect(response).toEqual(expect.objectContaining({ data: {} }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createDatasetItemReport(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEM_REPORT_CREATE[401],
      status: 401
    })
  })
})
