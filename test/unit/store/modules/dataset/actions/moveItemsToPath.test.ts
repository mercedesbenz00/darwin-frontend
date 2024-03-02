import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildDatasetPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { moveItemsToPath } from '@/store/modules/dataset/actions/moveItemsToPath'
import { DatasetItemPayload, StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ moveItemsToPath: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const datasetItems: DatasetItemPayload[] = [
  buildDatasetItemPayload({ id: 1, dataset_id: 1, path: '/' }),
  buildDatasetItemPayload({ id: 2, dataset_id: 1, path: '/' })
]

let payload: StoreActionPayload<typeof moveItemsToPath>

mockApi()

beforeEach(() => {
  jest.spyOn(backend, 'moveItemsToPath').mockResolvedValue(buildAxiosResponse({ data: null }))

  store = createUnstubbedTestStore()
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/PUSH_DATASET_ITEMS', datasetItems)

  const { dispatch } = store

  const mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (
      action.includes('loadDatasetFoldersThrottled') ||
      action.includes('loadDatasetItemCountsThrottled')
    ) {
      return Promise.resolve({ data: {} })
    } else {
      return dispatch(action, payload, opts)
    }
  })

  store.dispatch = mockDispatch

  payload = {
    dataset: buildDatasetPayload({ id: 1 }),
    filter: { dataset_item_ids: datasetItems.map(i => i.id) },
    path: '/test'
  }
})

const ACTION = 'dataset/moveItemsToPath'

it('calls correct backend endpoint', async () => {
  await store.dispatch(ACTION, payload)
  const backendPayload: Parameters<typeof backend.moveItemsToPath>[0] = {
    datasetId: payload.dataset.id,
    filter: payload.filter,
    path: '/test'
  }
  expect(backend.moveItemsToPath).toHaveBeenCalledWith(backendPayload)
})

it('returns error from backend', async () => {
  const error = { error: { message: 'foo', isValidationError: false } }
  jest.spyOn(backend, 'moveItemsToPath').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error).toEqual(error.error)
})

it('moves items to the right folder in the dataset store', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
  store.commit('dataset/ADD_DATASET_ITEMS', datasetItems)
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
  expect(store.state.dataset.datasetItems).toEqual(datasetItems)
  await store.dispatch('dataset/moveItemsToPath', payload)
  expect(store.state.dataset.datasetItems).toEqual([])
})

it('loads dataset folders and dataset item counts after successful response', async () => {
  await store.dispatch('dataset/moveItemsToPath', payload)

  expect(store.dispatch).toBeCalledWith('dataset/loadDatasetFoldersThrottled', { datasetId: 1 })
  expect(store.dispatch).toBeCalledWith('dataset/loadDatasetItemCountsThrottled', { dataset: payload.dataset })
})
