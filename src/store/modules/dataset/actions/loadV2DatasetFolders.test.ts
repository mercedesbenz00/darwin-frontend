import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildV2DatasetFolderPayload,
  buildDatasetPayload,
  buildAxiosResponse
} from 'test/unit/factories'

import {
  V2DatasetFolderPayload,
  DatasetItemStatus
} from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

jest.mock('@/utils/backend', () => ({ loadV2DatasetFolders: jest.fn() }))

let folders: V2DatasetFolderPayload[]

const sfh = buildDatasetPayload({ id: 5 })

beforeEach(() => {
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', buildDatasetDetailPayload({ id: sfh.id }))

  folders = [
    buildV2DatasetFolderPayload({ path: '/', dataset_id: sfh.id, filtered_item_count: 5 }),
    buildV2DatasetFolderPayload({ path: '/bar', dataset_id: sfh.id, filtered_item_count: 5 }),
    buildV2DatasetFolderPayload({ path: '/baz', dataset_id: sfh.id, filtered_item_count: 5 })
  ]

  jest.spyOn(backend, 'loadV2DatasetFolders').mockResolvedValue(buildAxiosResponse({ data: { folders } }))
})

afterEach(() => {
  (backend.loadV2DatasetFolders as jest.Mock).mockReset()
})

const statuses = [
  DatasetItemStatus.annotate,
  DatasetItemStatus.complete,
  DatasetItemStatus.error,
  DatasetItemStatus.new,
  DatasetItemStatus.processing,
  DatasetItemStatus.review,
  DatasetItemStatus.uploading
]

it('calls correct API endpoint, page by page', async () => {
  // dispatch and await first response, trigger next poll, await second response
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: sfh.id })

  expect(backend.loadV2DatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({ dataset_ids: [sfh.id] }))
})

it('pushes items to store', async () => {
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: sfh.id })

  expect(store.state.dataset.datasetFoldersV2).toEqual(folders)
  expect(store.state.dataset.datasetTreefiedFoldersV2).toEqual([{
    ...folders[0],
    children: [folders[1], folders[2]]
  }])
})

it('passes in stage template filters', async () => {
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { workflow_stage_template_ids: [1, 2] })
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: 5 })
  expect(backend.loadV2DatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      dataset_ids: [5],
      statuses,
      workflow_stage_template_ids: [1, 2]
    }))
})

it('passes in status filters', async () => {
  const statuses = [DatasetItemStatus.new]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { statuses })
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: 5 })
  expect(backend.loadV2DatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({ dataset_ids: [5], statuses }))
})

it('passes in class filters', async () => {
  const classIds = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { annotation_class_ids: classIds })
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: 5 })
  expect(backend.loadV2DatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      dataset_ids: [5],
      statuses,
      annotation_class_ids: classIds
    }))
})

it('passes in assignees', async () => {
  const assignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { assignees })
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: 5 })
  expect(backend.loadV2DatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      dataset_ids: [5],
      assignees,
      statuses
    }))
})

it('passes in current assignees', async () => {
  const currentAssignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { current_assignees: currentAssignees })
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: 5 })
  expect(backend.loadV2DatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      dataset_ids: [5],
      current_assignees: currentAssignees,
      statuses
    }))
})

it('passes in path', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { path: '/foo' })
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: 5 })
  expect(backend.loadV2DatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      dataset_ids: [5],
      statuses,
      path: '/foo'
    }))
})

it('passes in paths', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { paths: ['/foo'] })
  await store.dispatch('dataset/loadV2DatasetFolders', { datasetId: 5 })
  expect(backend.loadV2DatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      dataset_ids: [5],
      statuses,
      paths: ['/foo']
    }))
})
