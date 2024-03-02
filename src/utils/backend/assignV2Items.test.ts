import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { assignV2Items } from '@/utils/backend/index'

mockApi()

let backend: jest.SpyInstance
let payload: Parameters<typeof assignV2Items>[0]

beforeEach(() => {
  payload = {
    assigneeId: 2,
    workflowId: 'foo',
    teamSlug: 'v7',
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] }
  }

  backend = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: payload }))
})

afterEach(() => {
  backend.mockReset()
})

it('sends request to backend', async () => {
  await assignV2Items(payload)
  expect(backend).toHaveBeenCalledWith('v2/teams/v7/items/assign', {
    assignee_id: 2,
    workflow_id: 'foo',
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] }
  })
})

it('returns response from backend', async () => {
  const response = await assignV2Items(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  backend.mockRejectedValue(backendUnauthenticatedError)

  const response = await assignV2Items(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEMS_UPDATE[401],
      status: 401
    })
  })
})
