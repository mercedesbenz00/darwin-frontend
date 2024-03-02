import { buildDatasetPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadDataset } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let payload: Parameters<typeof loadDataset>[0]

const sfh = buildDatasetPayload({ id: 5 })

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: sfh }))
  payload = { datasetId: 5 }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadDataset(payload)
  expect(apiGet).toHaveBeenCalledWith('datasets/5')
})

it('returns response from backend', async () => {
  const response = await loadDataset(payload)
  expect(response).toEqual(expect.objectContaining({ data: sfh }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadDataset({ datasetId: 2 })

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_LOAD[401],
      status: 401
    })
  })
})
