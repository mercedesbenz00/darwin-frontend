import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildDatasetPayload, buildAxiosResponse, buildParsedError } from 'test/unit/factories'

import { archiveDatasetItems } from '@/store/modules/dataset/actions/archiveDatasetItems'
import { DatasetItemPayload, DatasetItemStatus } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ archiveItems: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const datasetItems: DatasetItemPayload[] = [
  buildDatasetItemPayload({ id: 1, path: '/', status: DatasetItemStatus.annotate }),
  buildDatasetItemPayload({ id: 2, path: '/', status: DatasetItemStatus.annotate })
]

const ACTION = 'dataset/archiveDatasetItems'

const payload: Parameters<typeof archiveDatasetItems>[1] = {
  dataset: buildDatasetPayload({ id: 5 }),
  filter: { path: '/foo' }
}

beforeEach(() => {
  jest.spyOn(backend, 'archiveItems').mockResolvedValue(buildAxiosResponse({ data: null }))

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
  expect(backend.archiveItems).toHaveBeenCalledWith({
    datasetId: payload.dataset.id,
    filter: { path: '/foo' }
  })
})

it('returns error from backend', async () => {
  const error = buildParsedError({ message: 'foo' })
  jest.spyOn(backend, 'archiveItems').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error.message).toEqual('foo')
})

it('pushes items to store when all selected', async () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
  await store.dispatch(ACTION, payload)
  expect(store.state.dataset.datasetItems).toEqual([
    { ...datasetItems[0], status: DatasetItemStatus.archived },
    { ...datasetItems[1], status: DatasetItemStatus.archived }
  ])
})

it('pushes items to store when individual selected', async () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [datasetItems[0]], selected: true })
  await store.dispatch(ACTION, payload)
  expect(store.state.dataset.datasetItems).toEqual([
    { ...datasetItems[0], status: DatasetItemStatus.archived },
    datasetItems[1]
  ])
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch).toBeCalledWith('dataset/loadDatasetItemCountsThrottled', { dataset: payload.dataset })
})
