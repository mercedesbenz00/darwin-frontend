import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { DatasetItemStatus, DatasetItemType } from '@/store/types'
import { api, errorMessages } from '@/utils'
import { loadDatasetItems } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [] }))
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadDatasetItems({ datasetId: 5 })
  expect(apiGet).toHaveBeenCalledWith('datasets/5/items', {})
})

it('passes optional workflow_stage_template_ids', async () => {
  await loadDatasetItems({ datasetId: 5, workflow_stage_template_ids: [1, 2] })
  expect(apiGet).toHaveBeenCalledWith('datasets/5/items', { workflow_stage_template_ids: [1, 2] })
})

it('passes optional types', async () => {
  const types = [DatasetItemType.image, DatasetItemType.playbackVideo]
  await loadDatasetItems({ datasetId: 5, types })
  expect(apiGet).toHaveBeenCalledWith('datasets/5/items', { types })
})

it('passes optional statuses', async () => {
  const statuses = [DatasetItemStatus.new, DatasetItemStatus.complete]
  await loadDatasetItems({ datasetId: 5, statuses })
  expect(apiGet).toHaveBeenCalledWith('datasets/5/items', { statuses })
})

it('returns response from backend', async () => {
  const response = await loadDatasetItems({ datasetId: 2 })
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadDatasetItems({ datasetId: 2 })

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.WORKVIEW_IMAGES_LOAD[401],
      status: 401
    })
  })
})
