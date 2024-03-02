import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { untagDatasetItemsV2 } from '@/utils/backend'

mockApi()

let apiDelete: jest.SpyInstance

let payload: Parameters<typeof untagDatasetItemsV2>[0]

beforeEach(() => {
  apiDelete = jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    annotationClassId: 3,
    teamSlug: 'team',
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] }
  }
})

afterEach(() => {
  apiDelete.mockReset()
})

it('sends request to backend', async () => {
  await untagDatasetItemsV2(payload)
  expect(apiDelete).toHaveBeenCalledWith(`v2/teams/${payload.teamSlug}/items/slots/tags`, {
    annotation_class_id: 3,
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] }
  })
})

it('returns response from backend', async () => {
  const response = await untagDatasetItemsV2(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiDelete.mockRejectedValue(backendUnauthenticatedError)

  const response = await untagDatasetItemsV2(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_IMAGE_TAG[401],
      status: 401
    })
  })
})
