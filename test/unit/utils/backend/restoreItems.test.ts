import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { restoreItems } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance
let payload: Parameters<typeof restoreItems>[0]

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    datasetId: 5,
    filter: { dataset_item_ids: [1, 6, 9] }
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await restoreItems(payload)
  expect(apiPut).toHaveBeenCalledWith('datasets/5/items/restore', {
    filter: { dataset_item_ids: [1, 6, 9] }
  })
})

it('returns response from backend', async () => {
  const response = await restoreItems(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await restoreItems(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_IMAGE_RESTORE[401],
      status: 401
    })
  })
})
