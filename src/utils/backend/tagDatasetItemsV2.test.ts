import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { tagDatasetItemsV2 } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof tagDatasetItemsV2>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    annotationClassId: 3,
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] },
    teamSlug: 'team'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await tagDatasetItemsV2(payload)
  expect(apiPost).toHaveBeenCalledWith(`v2/teams/${payload.teamSlug}/items/slots/tags`, {
    annotation_class_id: 3,
    filters: { dataset_ids: [5], item_ids: ['1', '6', '9'] }
  })
})

it('returns response from backend', async () => {
  const response = await tagDatasetItemsV2(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await tagDatasetItemsV2(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_IMAGE_TAG[401],
      status: 401
    })
  })
})
