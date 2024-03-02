import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildParsedError } from 'test/unit/factories'

import { ExportDatasetParams } from '@/store/modules/dataset/types'
import { DatasetItemStatus, DatasetItemType } from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>
let params: ExportDatasetParams

jest.mock('@/utils/backend', () => ({ exportDataset: jest.fn() }))

beforeEach(() => {
  params = {
    annotationFilter: {},
    datasetId: 1,
    filter: {
      annotation_class_ids: [1],
      assignees: [2, 3],
      current_assignees: [2, 3],
      dataset_item_ids: [1, 2],
      path: '/root',
      statuses: [DatasetItemStatus.complete, DatasetItemStatus.annotate],
      types: [DatasetItemType.image],
      video_ids: [1],
      workflow_stage_template_ids: [1, 2]
    },
    format: 'json',
    includeAuthorship: true,
    includeExportToken: true,
    name: 'Test Export'
  }
  store = createUnstubbedTestStore()

  jest.spyOn(backend, 'exportDataset').mockResolvedValue(buildAxiosResponse({ data: {} }))
})

it('calls correct API endpoint', async () => {
  await store.dispatch('dataset/exportDataset', params)
  await flushPromises()

  expect(backend.exportDataset).toHaveBeenCalledWith({
    annotation_filter: {},
    dataset_id: 1,
    filter: {
      annotation_class_ids: [1],
      assignees: [2, 3],
      current_assignees: [2, 3],
      dataset_item_ids: [1, 2],
      path: '/root',
      statuses: [DatasetItemStatus.complete, DatasetItemStatus.annotate],
      types: [DatasetItemType.image],
      video_ids: [1],
      workflow_stage_template_ids: [1, 2]
    },
    format: 'json',
    include_authorship: true,
    include_export_token: true,
    name: 'Test Export'
  })
})

it('returns the backend response', async () => {
  const response = await store.dispatch('dataset/exportDataset', params)
  await flushPromises()

  expect(response.data).toEqual({})
})

it('returns the error when the request fails', async () => {
  const errorResponse = buildParsedError({})
  jest.spyOn(backend, 'exportDataset').mockResolvedValue(errorResponse)
  const response = await store.dispatch('dataset/exportDataset', params)
  await flushPromises()

  expect(response).toEqual(errorResponse)
})
