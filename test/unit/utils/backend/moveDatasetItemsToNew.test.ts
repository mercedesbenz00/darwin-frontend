import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { moveDatasetItemsToNew } from '@/utils/backend'

mockApi()

let backend: jest.SpyInstance

let payload: Parameters<typeof moveDatasetItemsToNew>[0]

beforeEach(() => {
  backend = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    datasetId: 5,
    filter: { dataset_item_ids: [1, 6, 9] }
  }
})

afterEach(() => {
  backend.mockReset()
})

it('sends request to backend', async () => {
  await moveDatasetItemsToNew(payload)
  expect(backend).toHaveBeenCalledWith('datasets/5/items/move_to_new', {
    filter: { dataset_item_ids: [1, 6, 9] }
  })
})

it('returns response from backend', async () => {
  const response = await moveDatasetItemsToNew(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  backend.mockRejectedValue(backendUnauthenticatedError)

  const response = await moveDatasetItemsToNew(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEMS_UPDATE[401],
      status: 401
    })
  })
})
