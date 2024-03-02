import { buildDatasetReportPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { DatasetItemStatus, DatasetItemType } from '@/store/types'
import { api, errorMessages } from '@/utils'
import { loadDatasetReport } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let payload: Parameters<typeof loadDatasetReport>[0]

const report = buildDatasetReportPayload({ id: 5 })

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: report }))
  payload = { datasetId: 5 }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadDatasetReport(payload)
  expect(apiGet).toHaveBeenCalledWith('datasets/5/report', {})
})

it('passes filter params to backend', async () => {
  const filter = { statuses: [DatasetItemStatus.annotate], type: [DatasetItemType.videoFrame] }
  await loadDatasetReport({ ...payload, ...filter })
  expect(apiGet).toHaveBeenCalledWith('datasets/5/report', filter)
})

it('returns response from backend', async () => {
  const response = await loadDatasetReport(payload)
  expect(response).toEqual(expect.objectContaining({ data: report }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadDatasetReport({ datasetId: 2 })

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_LOAD[401],
      status: 401
    })
  })
})
