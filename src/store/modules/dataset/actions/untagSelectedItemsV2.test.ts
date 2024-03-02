import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildDatasetPayload,
  buildV2DatasetItemPayload
} from 'test/unit/factories'

import { untagSelectedItemsV2 } from '@/store/modules/dataset/actions/untagSelectedItemsV2'
import { V2DatasetItemPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ untagDatasetItemsV2: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const items: V2DatasetItemPayload[] = [
  buildV2DatasetItemPayload({ id: '1' }),
  buildV2DatasetItemPayload({ id: '2', path: '/' }),
  buildV2DatasetItemPayload({ id: '3', path: '/' })
]

const ACTION = 'dataset/untagSelectedItemsV2'

const payload: Parameters<typeof untagSelectedItemsV2>[1] = {
  annotationClassId: 3,
  dataset: buildDatasetPayload({ id: 5 }),
  filters: { item_ids: items.map(i => i.id) }
}

beforeEach(() => {
  jest.spyOn(backend, 'untagDatasetItemsV2').mockResolvedValue(buildAxiosResponse({ data: null }))

  store = createUnstubbedTestStore()

  const { dispatch } = store

  const mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (
      action.includes('loadV2DatasetItemCountsThrottled')
    ) {
      return Promise.resolve({ data: {} })
    } else {
      return dispatch(action, payload, opts)
    }
  })

  store.dispatch = mockDispatch
})

afterEach(() => {
  (backend.untagDatasetItemsV2 as jest.Mock).mockReset()
})

describe('when some selected', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
    store.commit('dataset/SET_SELECTED_ITEMS', ['1', '2', '3'])
  })

  it('calls backend endpoint with current filter', async () => {
    await store.dispatch(ACTION, payload)
    const expected: Parameters<typeof backend.untagDatasetItemsV2>[0] = {
      annotationClassId: payload.annotationClassId,
      teamSlug: payload.dataset.team_slug,
      filters: { dataset_ids: [payload.dataset.id], item_ids: ['1', '2', '3'] }
    }
    expect(backend.untagDatasetItemsV2).toHaveBeenCalledWith(expected)
  })

  it('returns error from backend', async () => {
    const error = { error: { message: 'foo', isValidationError: false } }
    jest.spyOn(backend, 'untagDatasetItemsV2').mockResolvedValue(error)
    const response = await store.dispatch(ACTION, payload)
    expect(response.error).toEqual(error.error)
  })

  it('dispatches to load item counts', async () => {
    await store.dispatch(ACTION, payload)
    expect(store.dispatch).toBeCalledWith(
      'dataset/loadV2DatasetItemCountsThrottled',
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
    expect(backend.untagDatasetItemsV2).not.toHaveBeenCalled()
  })
})
