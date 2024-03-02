import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { setDatasetItemsStage } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof setDatasetItemsStage>[0]

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    datasetId: 5,
    datasetItemIds: [1, 6, 9],
    workflowStageTemplateId: 7
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await setDatasetItemsStage(payload)
  expect(apiPut).toHaveBeenCalledWith('datasets/5/set_stage', {
    filter: { dataset_item_ids: [1, 6, 9] },
    workflow_stage_template_id: 7
  })
})

it('returns response from backend', async () => {
  const response = await setDatasetItemsStage(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await setDatasetItemsStage(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEMS_UPDATE[401],
      status: 401
    })
  })
})
