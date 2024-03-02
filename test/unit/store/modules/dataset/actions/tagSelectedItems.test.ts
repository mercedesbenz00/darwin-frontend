import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildDatasetPayload, buildAxiosResponse } from 'test/unit/factories'

import { tagSelectedItems } from '@/store/modules/dataset/actions/tagSelectedItems'
import { DatasetItemFilter, DatasetItemPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ tagDatasetItems: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const items: DatasetItemPayload[] = [
  buildDatasetItemPayload({ id: 1, labels: [] }),
  buildDatasetItemPayload({ id: 2, path: '/', labels: [3, 4] }),
  buildDatasetItemPayload({ id: 3, path: '/', labels: [5] })
]

const ACTION = 'dataset/tagSelectedItems'

const payload: Parameters<typeof tagSelectedItems>[1] = {
  annotationClassId: 3,
  dataset: buildDatasetPayload({ id: 5 })
}

beforeEach(() => {
  jest.spyOn(backend, 'tagDatasetItems').mockResolvedValue(buildAxiosResponse({ data: null }))

  store = createUnstubbedTestStore()
  store.commit('dataset/PUSH_DATASET_ITEMS', items)

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

afterEach(() => {
  (backend.tagDatasetItems as jest.Mock).mockReset()
})

describe('when all selected', () => {
  const filter: DatasetItemFilter = {
    path: '/'
  }
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', filter)
  })

  it('calls backend endpoint with current filter', async () => {
    await store.dispatch(ACTION, payload)
    const expected: Parameters<typeof backend.tagDatasetItems>[0] = {
      annotationClassId: payload.annotationClassId,
      datasetId: payload.dataset.id,
      filter
    }
    expect(backend.tagDatasetItems).toHaveBeenCalledWith(expected)
  })

  it('returns error from backend', async () => {
    const error = { error: { message: 'foo', isValidationError: false } }
    jest.spyOn(backend, 'tagDatasetItems').mockResolvedValue(error)
    const response = await store.dispatch(ACTION, payload)
    expect(response.error).toEqual(error.error)
  })

  it('tags items in store', async () => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    await store.dispatch(ACTION, payload)
    expect(store.state.dataset.datasetItems).toEqual([
      { ...items[0], labels: [3] },
      { ...items[1], labels: [3, 4] },
      { ...items[2], labels: [5, 3] }
    ])
  })

  it('dispatches to load item counts', async () => {
    await store.dispatch(ACTION, payload)
    expect(store.dispatch).toBeCalledWith(
      'dataset/loadDatasetItemCountsThrottled',
      { dataset: payload.dataset }
    )
  })
})

describe('when some selected', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [items[0], items[1]], selected: true })
  })

  it('calls backend endpoint with selected item ids', async () => {
    await store.dispatch(ACTION, payload)
    const expected: Parameters<typeof backend.tagDatasetItems>[0] = {
      annotationClassId: payload.annotationClassId,
      datasetId: payload.dataset.id,
      filter: { dataset_item_ids: [1, 2] }
    }
    expect(backend.tagDatasetItems).toHaveBeenCalledWith(expected)
  })

  it('returns error from backend', async () => {
    const error = { error: { message: 'foo', isValidationError: false } }
    jest.spyOn(backend, 'tagDatasetItems').mockResolvedValue(error)
    const response = await store.dispatch(ACTION, payload)
    expect(response.error).toEqual(error.error)
  })

  it('tags items in store', async () => {
    await store.dispatch(ACTION, payload)
    expect(store.state.dataset.datasetItems).toEqual([
      { ...items[0], labels: [3] },
      { ...items[1], labels: [3, 4] },
      // this one was not tagged because it was not selected
      { ...items[2], labels: [5] }
    ])
  })

  it('dispatches to load item counts', async () => {
    await store.dispatch(ACTION, payload)
    expect(store.dispatch).toBeCalledWith(
      'dataset/loadDatasetItemCountsThrottled',
      { dataset: payload.dataset }
    )
  })
})

describe('when none selected', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  })

  it('does not call backend', async () => {
    await store.dispatch(ACTION, payload)
    expect(backend.tagDatasetItems).not.toHaveBeenCalled()
  })
})
