import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { DatasetItemStatus, DatasetItemType } from '@/store/types'
import { api, errorMessages } from '@/utils'
import { exportDataset } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof exportDataset>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: '' }))
  payload = {
    annotation_filter: {},
    dataset_id: 1,
    filter: {
      not_annotation_class_ids: [2],
      annotation_class_ids: [1],
      assignees: [2, 3],
      current_assignees: [2, 3],
      dataset_item_ids: [1, 2],
      path: '/root',
      statuses: [DatasetItemStatus.complete, DatasetItemStatus.annotate],
      filenames: ['foo'],
      types: [DatasetItemType.image],
      video_ids: [1],
      workflow_stage_template_ids: [1, 2]
    },
    format: 'json',
    include_authorship: true,
    include_export_token: true,
    name: 'Test Export'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await exportDataset(payload)
  expect(apiPost).toHaveBeenCalledWith('datasets/1/exports', {
    annotation_filter: {},
    filter: {
      not_annotation_class_ids: [2],
      annotation_class_ids: [1],
      assignees: [2, 3],
      current_assignees: [2, 3],
      dataset_item_ids: [1, 2],
      path: '/root',
      filenames: ['foo'],
      statuses: ['complete', 'annotate'],
      types: ['image'],
      video_ids: [1],
      workflow_stage_template_ids: [1, 2]
    },
    format: 'json',
    include_authorship: true,
    include_export_token: true,
    name: 'Test Export'
  })
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await exportDataset(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_EXPORT[401],
      status: 401
    })
  })
})
