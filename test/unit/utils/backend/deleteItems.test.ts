import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { deleteItems } from '@/utils/backend'

mockApi()

let apiRemove: jest.SpyInstance
let payload: Parameters<typeof deleteItems>[0]

beforeEach(() => {
  apiRemove = jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    datasetId: 5,
    filter: { dataset_item_ids: [1, 6, 9] }
  }
})

afterEach(() => {
  apiRemove.mockReset()
})

it('sends request to backend', async () => {
  await deleteItems(payload)
  expect(apiRemove).toHaveBeenCalledWith('datasets/5/items', {
    filter: { dataset_item_ids: [1, 6, 9] }
  })
})

it('returns response from backend', async () => {
  const response = await deleteItems(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiRemove.mockRejectedValue(backendUnauthenticatedError)

  const response = await deleteItems(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_IMAGE_DELETE[401],
      status: 401
    })
  })
})
