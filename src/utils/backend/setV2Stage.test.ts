import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { setV2Stage } from '@/utils/backend/index'

mockApi()

let backend: jest.SpyInstance
let payload: Parameters<typeof setV2Stage>[0]

beforeEach(() => {
  payload = {
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] },
    stageId: 'bar',
    teamSlug: 'v7',
    workflowId: 'foo'
  }

  backend = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: payload }))
})

afterEach(() => {
  backend.mockReset()
})

it('sends request to backend', async () => {
  await setV2Stage(payload)
  expect(backend).toHaveBeenCalledWith('v2/teams/v7/items/stage', {
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] },
    stage_id: 'bar',
    workflow_id: 'foo'
  })
})

it('returns response from backend', async () => {
  const response = await setV2Stage(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  backend.mockRejectedValue(backendUnauthenticatedError)

  const response = await setV2Stage(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEMS_UPDATE[401],
      status: 401
    })
  })
})
