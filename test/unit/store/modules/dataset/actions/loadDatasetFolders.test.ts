import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildDatasetFolderPayload,
  buildDatasetPayload,
  buildAxiosResponse
} from 'test/unit/factories'

import {
  DatasetFolderPayload,
  DatasetItemStatus
} from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

jest.mock('@/utils/backend', () => ({ loadDatasetFolders: jest.fn() }))

let folders: DatasetFolderPayload[]

const sfh = buildDatasetPayload({ id: 5 })

beforeEach(() => {
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', buildDatasetDetailPayload({ id: sfh.id }))

  folders = [
    buildDatasetFolderPayload({ path: '/', dataset_id: sfh.id, direct_item_count_filtered: 5 }),
    buildDatasetFolderPayload({ path: '/bar', dataset_id: sfh.id, direct_item_count_filtered: 5 }),
    buildDatasetFolderPayload({ path: '/baz', dataset_id: sfh.id, direct_item_count_filtered: 5 })
  ]

  jest.spyOn(backend, 'loadDatasetFolders').mockResolvedValue(buildAxiosResponse({ data: folders }))
})

afterEach(() => {
  (backend.loadDatasetFolders as jest.Mock).mockReset()
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
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: sfh.id })

  expect(backend.loadDatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({ datasetId: sfh.id }))
})

it('pushes items to store', async () => {
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: sfh.id })

  expect(store.state.dataset.datasetFolders).toEqual(folders)
  expect(store.state.dataset.datasetTreefiedFolders).toEqual([{
    ...folders[0],
    children: [folders[1], folders[2]]
  }])
})

it('passes in stage template filters', async () => {
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { workflow_stage_template_ids: [1, 2] })
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: 5 })
  expect(backend.loadDatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      statuses,
      workflow_stage_template_ids: [1, 2]
    }))
})

it('passes in status filters', async () => {
  const statuses = [DatasetItemStatus.new]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses })
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: 5 })
  expect(backend.loadDatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({ datasetId: 5, statuses }))
})

it('passes in class filters', async () => {
  const classIds = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { annotation_class_ids: classIds })
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: 5 })
  expect(backend.loadDatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      statuses,
      annotation_class_ids: classIds
    }))
})

it('passes in assignees', async () => {
  const assignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { assignees })
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: 5 })
  expect(backend.loadDatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      assignees,
      statuses
    }))
})

it('passes in current assignees', async () => {
  const currentAssignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { current_assignees: currentAssignees })
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: 5 })
  expect(backend.loadDatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      current_assignees: currentAssignees,
      statuses
    }))
})

it('passes in path', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/foo' })
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: 5 })
  expect(backend.loadDatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      statuses,
      path: '/foo'
    }))
})

it('passes in paths', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { paths: ['/foo'] })
  await store.dispatch('dataset/loadDatasetFolders', { datasetId: 5 })
  expect(backend.loadDatasetFolders)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      statuses,
      paths: ['/foo']
    }))
})
