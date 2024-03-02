import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildAxiosResponse
} from 'test/unit/factories'

import {
  DatasetItemPayload,
  DatasetItemStatus
} from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

jest.mock('@/utils/backend', () => ({ loadDatasetItems: jest.fn() }))

const sfh = buildDatasetPayload({ id: 5 })

let items: DatasetItemPayload[]

beforeEach(() => {
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', buildDatasetDetailPayload({ id: sfh.id }))

  items = [
    buildDatasetItemPayload({ id: 1, dataset_id: sfh.id }),
    buildDatasetItemPayload({ id: 2, dataset_id: sfh.id }),
    buildDatasetItemPayload({ id: 3, dataset_id: sfh.id })
  ]

  const page1Response = buildAxiosResponse({
    data: { items: [items[0], items[1]], metadata: { next: 3, previous: 2 } }
  })
  const page2Response = buildAxiosResponse({
    data: { items: [items[2]], metadata: { next: null, previous: 3 } }
  })

  jest.spyOn(backend, 'loadDatasetItems')
    .mockResolvedValueOnce(page1Response)
    .mockResolvedValue(page2Response)

  jest.useFakeTimers()
})

afterEach(() => {
  (backend.loadDatasetItems as jest.Mock).mockReset()
  jest.clearAllTimers()
  jest.useRealTimers()
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
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: sfh.id })
  await flushPromises()
  jest.runAllTimers()
  await flushPromises()

  expect(backend.loadDatasetItems).toHaveBeenNthCalledWith(1, expect.objectContaining({
    datasetId: sfh.id,
    page: { size: 500 }
  }))

  expect(backend.loadDatasetItems).toHaveBeenNthCalledWith(2, expect.objectContaining({
    datasetId: sfh.id,
    page: { size: 500, from: 3 }
  }))
})

it('pushes items to store', async () => {
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: sfh.id })
  await flushPromises()

  // trigger next setTimeout and await api response
  jest.runAllTimers()
  await flushPromises()

  expect(store.state.dataset.datasetItems).toEqual(items)
})

it('sets loaded flag even if there is just one page of results', async () => {
  // We had a bug where we would set state.datasetItemsLoaded after checking if
  // metadata has a "next" cursor. In the case of only one page of items, that
  // means we would never have set the loaded flag.
  const response = { data: { items, metadata: { next: null, previous: 3 } } }
  jest.spyOn(backend, 'loadDatasetItems').mockResolvedValue(buildAxiosResponse(response))

  expect(store.state.dataset.datasetItemsLoaded).toBe(false)

  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: sfh.id })
  await flushPromises()

  expect(store.state.dataset.datasetItemsLoaded).toBe(true)
})

it('registers poller', async () => {
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: sfh.id })
  expect(store.state.dataset.itemsPollers)
    .toEqual([expect.objectContaining({ callsWithoutChange: 0, id: sfh.id })])

  // trigger next setTimeout and await api response
  jest.runAllTimers()
  await flushPromises()

  expect(store.state.dataset.itemsPollers)
    .toEqual([expect.objectContaining({ callsWithoutChange: 0, id: sfh.id })])

  // trigger next setTimeout and await api response
  jest.runAllTimers()
  await flushPromises()

  expect(store.state.dataset.itemsPollers)
    .toEqual([expect.objectContaining({ callsWithoutChange: 0, id: sfh.id })])
})

it('passes in stage template filters', async () => {
  const page = { from: 1, to: 50, size: 20 }

  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { workflow_stage_template_ids: [1, 2] })
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: 5, page })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      statuses,
      workflow_stage_template_ids: [1, 2]
    }))
})

it('passes in status filters', async () => {
  const page = { from: 1, to: 50, size: 20 }

  const statuses = [DatasetItemStatus.new]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses })
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: 5, page })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ datasetId: 5, statuses }))
})

it('passes in class filters', async () => {
  const classIds = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { annotation_class_ids: [1, 2] })
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: 5 })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      statuses,
      annotation_class_ids: classIds
    }))
})

it('passes in assignees', async () => {
  const assignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { assignees })
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: 5 })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      assignees,
      statuses
    }))
})

it('passes in current assignees', async () => {
  const currentAssignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { current_assignees: currentAssignees })
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: 5 })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      current_assignees: currentAssignees,
      statuses
    }))
})

it('passes in path', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/foo' })
  await store.dispatch('dataset/loadAllDatasetItems', { datasetId: 5 })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({
      datasetId: 5,
      statuses,
      path: '/foo'
    }))
})
