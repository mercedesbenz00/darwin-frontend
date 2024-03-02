import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { assignItems } from '@/utils/backend'

mockApi()

let backend: jest.SpyInstance
let payload: Parameters<typeof assignItems>[0]

beforeEach(() => {
  backend = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: payload }))
  payload = {
    assigneeId: 2,
    datasetId: 5,
    filter: { dataset_item_ids: [1, 6, 9] }
  }
})

afterEach(() => {
  backend.mockReset()
})

it('sends request to backend', async () => {
  await assignItems(payload)
  expect(backend).toHaveBeenCalledWith('datasets/5/assign_items', {
    assignee_id: 2,
    filter: { dataset_item_ids: [1, 6, 9] }
  })
})

it('returns response from backend', async () => {
  const response = await assignItems(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  backend.mockRejectedValue(backendUnauthenticatedError)

  const response = await assignItems(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.WORKVIEW_IMAGES_LOAD[401],
      status: 401
    })
  })
})
