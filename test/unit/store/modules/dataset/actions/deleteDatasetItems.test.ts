import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildParsedError
} from 'test/unit/factories'

import { deleteDatasetItems } from '@/store/modules/dataset/actions/deleteDatasetItems'
import { DatasetItemPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ deleteItems: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const datasetItems: DatasetItemPayload[] = [
  buildDatasetItemPayload({ id: 1, path: '/' }),
  buildDatasetItemPayload({ id: 2, path: '/' })
]

const ACTION = 'dataset/deleteDatasetItems'

const payload: Parameters<typeof deleteDatasetItems>[1] = {
  dataset: buildDatasetPayload({ id: 5 }),
  filter: { path: '/foo' }
}

beforeEach(() => {
  jest.spyOn(backend, 'deleteItems').mockResolvedValue(buildAxiosResponse({ data: datasetItems }))

  store = createUnstubbedTestStore()
  store.commit('dataset/PUSH_DATASET_ITEMS', datasetItems)

  const { dispatch } = store

  const mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (
      action.includes('loadDatasetItemCountsThrottled')
    ) {
      return Promise.resolve({ data: {} })
    } else {
      return dispatch(action, payload, opts)
    }
  })

  store.dispatch = mockDispatch
})

it('calls correct backend endpoint', async () => {
  await store.dispatch(ACTION, payload)
  expect(backend.deleteItems).toHaveBeenCalledWith({
    datasetId: payload.dataset.id,
    filter: { path: '/foo' }
  })
})

it('returns error from backend', async () => {
  jest.spyOn(backend, 'deleteItems').mockResolvedValue(buildParsedError({ message: 'foo' }))
  const response = await store.dispatch(ACTION, payload)
  expect(response.error.message).toEqual('foo')
})

it('removes all items froms store if all selected', async () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
  expect(store.state.dataset.datasetItems).toEqual(datasetItems)
  await store.dispatch(ACTION, payload)
  expect(store.state.dataset.datasetItems).toEqual([])
})

it('removes individual items froms store if some selected', async () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [datasetItems[0]], selected: true })
  expect(store.state.dataset.datasetItems).toEqual(datasetItems)
  await store.dispatch(ACTION, payload)
  expect(store.state.dataset.datasetItems).toEqual([datasetItems[1]])
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch).toBeCalledWith('dataset/loadDatasetItemCountsThrottled', { dataset: payload.dataset })
})
