import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { addPriorityToItems } from '@/utils/backend'

mockApi()

let backend: jest.SpyInstance
let payload: Parameters<typeof addPriorityToItems>[0]

beforeEach(() => {
  backend = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: payload }))
  payload = {
    datasetId: 5,
    filter: { dataset_item_ids: [1, 6, 9] },
    priority: 2
  }
})

afterEach(() => {
  backend.mockReset()
})

it('sends request to backend', async () => {
  await addPriorityToItems(payload)
  expect(backend).toHaveBeenCalledWith('datasets/5/items/priority', {
    filter: { dataset_item_ids: [1, 6, 9] },
    priority: 2
  })
})

it('returns response from backend', async () => {
  const response = await addPriorityToItems(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  backend.mockRejectedValue(backendUnauthenticatedError)

  const response = await addPriorityToItems(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEMS_ADD_PRIORITY[401],
      status: 401
    })
  })
})
