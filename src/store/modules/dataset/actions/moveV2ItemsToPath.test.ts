import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildV2DatasetItemPayload,
  buildDatasetPayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { moveV2ItemsToPath } from '@/store/modules/dataset/actions/moveV2ItemsToPath'
import { V2DatasetItemPayload, StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ moveV2ItemsToPath: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const datasetItems: V2DatasetItemPayload[] = [
  buildV2DatasetItemPayload({ id: '1', dataset_id: 1, path: '/' }),
  buildV2DatasetItemPayload({ id: '2', dataset_id: 1, path: '/' })
]

let payload: StoreActionPayload<typeof moveV2ItemsToPath>

mockApi()

beforeEach(() => {
  jest.spyOn(backend, 'moveV2ItemsToPath').mockResolvedValue(buildAxiosResponse({ data: null }))

  store = createUnstubbedTestStore()
  store.commit('dataset/SET_FOLDER_ENABLED', true)

  const { dispatch } = store

  const mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (
      action.includes('loadV2DatasetFoldersThrottled') ||
      action.includes('loadV2DatasetItemCountsThrottled')
    ) {
      return Promise.resolve({ data: {} })
    } else {
      return dispatch(action, payload, opts)
    }
  })

  store.dispatch = mockDispatch

  payload = {
    dataset: buildDatasetPayload({ id: 1 }),
    filters: { item_ids: datasetItems.map(i => i.id) },
    path: '/test'
  }
})

const ACTION = 'dataset/moveV2ItemsToPath'

it('calls correct backend endpoint', async () => {
  await store.dispatch(ACTION, payload)
  const backendPayload: Parameters<typeof backend.moveV2ItemsToPath>[0] = {
    teamSlug: payload.dataset.team_slug,
    filters: { ...payload.filters, dataset_ids: [1] },
    path: '/test'
  }
  expect(backend.moveV2ItemsToPath).toHaveBeenCalledWith(backendPayload)
})

it('returns error from backend', async () => {
  const error = { error: { message: 'foo', isValidationError: false } }
  jest.spyOn(backend, 'moveV2ItemsToPath').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error).toEqual(error.error)
})

it('loads dataset folders and dataset item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)

  expect(store.dispatch).toBeCalledWith('dataset/loadV2DatasetFoldersThrottled',
    {
      datasetId: payload.dataset.id,
      teamSlug: payload.dataset.team_slug
    }
  )
  expect(store.dispatch)
    .toBeCalledWith('dataset/loadV2DatasetItemCountsThrottled', { dataset: payload.dataset })
})
