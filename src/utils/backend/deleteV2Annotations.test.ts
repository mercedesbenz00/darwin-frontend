import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { deleteV2Annotations } from '@/utils/backend/index'

mockApi()

let backend: jest.SpyInstance
let payload: Parameters<typeof deleteV2Annotations>[0]

beforeEach(() => {
  payload = {
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] },
    teamSlug: 'v7',
    workflowId: 'foo'
  }

  backend = jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: payload }))
})

afterEach(() => {
  backend.mockReset()
})

it('sends request to backend', async () => {
  await deleteV2Annotations(payload)
  expect(backend).toHaveBeenCalledWith('v2/teams/v7/items/annotations', {
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] },
    workflow_id: 'foo'
  })
})

it('returns response from backend', async () => {
  const response = await deleteV2Annotations(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  backend.mockRejectedValue(backendUnauthenticatedError)

  const response = await deleteV2Annotations(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEMS_UPDATE[401],
      status: 401
    })
  })
})
