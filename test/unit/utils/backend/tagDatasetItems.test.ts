import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { tagDatasetItems } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof tagDatasetItems>[0]

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    annotationClassId: 3,
    datasetId: 5,
    filter: { dataset_item_ids: [1, 6, 9] }
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await tagDatasetItems(payload)
  expect(apiPut).toHaveBeenCalledWith('datasets/5/tag_items', {
    annotation_class_id: 3,
    filter: { dataset_item_ids: [1, 6, 9] }
  })
})

it('returns response from backend', async () => {
  const response = await tagDatasetItems(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await tagDatasetItems(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_IMAGE_TAG[401],
      status: 401
    })
  })
})
