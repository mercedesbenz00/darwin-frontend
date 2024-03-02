import { buildWorkforceManagerPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadWorkforceManagers } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let payload: Parameters<typeof loadWorkforceManagers>[0]

const managers = [buildWorkforceManagerPayload({})]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: managers }))
  payload = { datasetId: 5 }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadWorkforceManagers(payload)
  expect(apiGet).toHaveBeenCalledWith('datasets/5/workforce_managers')
})

it('returns response from backend', async () => {
  const response = await loadWorkforceManagers(payload)
  expect(response).toEqual(expect.objectContaining({ data: managers }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadWorkforceManagers({ datasetId: 2 })

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_LOAD[401],
      status: 401
    })
  })
})
