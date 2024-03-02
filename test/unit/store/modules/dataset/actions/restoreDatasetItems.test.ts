import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetPayload } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { restoreDatasetItems } from '@/store/modules/dataset/actions/restoreDatasetItems'
import { DatasetItemPayload, DatasetItemStatus } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ restoreItems: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const datasetItems: DatasetItemPayload[] = [
  initializeARWorkflow({ id: 1, path: '/', status: DatasetItemStatus.archived }),
  initializeARWorkflow({ id: 2, path: '/', status: DatasetItemStatus.archived })
]

const ACTION = 'dataset/restoreDatasetItems'

const payload: Parameters<typeof restoreDatasetItems>[1] = {
  dataset: buildDatasetPayload({ id: 5 }),
  filter: { path: '/foo' }
}

beforeEach(() => {
  jest.spyOn(backend, 'restoreItems').mockResolvedValue(buildAxiosResponse({ data: null }))

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
  expect(backend.restoreItems).toHaveBeenCalledWith({
    datasetId: payload.dataset.id,
    filter: { path: '/foo' }
  })
})

it('returns error from backend', async () => {
  const error = { error: { message: 'foo', isValidationError: false } }
  jest.spyOn(backend, 'restoreItems').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error).toEqual(error.error)
})

it('pushes items to store when all selected', async () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)

  await store.dispatch(ACTION, payload)
  expect(store.state.dataset.datasetItems).toEqual([
    { ...datasetItems[0], status: DatasetItemStatus.annotate },
    { ...datasetItems[1], status: DatasetItemStatus.annotate }
  ])
})

it('pushes items to store when individual selected', async () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [datasetItems[0]], selected: true })

  await store.dispatch(ACTION, payload)
  expect(store.state.dataset.datasetItems).toEqual([
    { ...datasetItems[0], status: DatasetItemStatus.annotate },
    datasetItems[1]
  ])
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch).toBeCalledWith('dataset/loadDatasetItemCountsThrottled', { dataset: payload.dataset })
})
