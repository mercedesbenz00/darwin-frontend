import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetPayload, buildAxiosResponse, buildParsedError } from 'test/unit/factories'

import { deleteV2DatasetItems } from '@/store/modules/dataset/actions/deleteV2DatasetItems'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ deleteV2Items: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'dataset/deleteV2DatasetItems'

const payload: Parameters<typeof deleteV2DatasetItems>[1] = {
  dataset: buildDatasetPayload({ id: 5 }),
  filters: { item_paths: ['/foo'] }
}

beforeEach(() => {
  jest.spyOn(backend, 'deleteV2Items').mockResolvedValue(buildAxiosResponse({ data: null }))

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

it('calls correct backend endpoint', async () => {
  await store.dispatch(ACTION, payload)
  expect(backend.deleteV2Items).toHaveBeenCalledWith({
    filters: { dataset_ids: [5], item_paths: ['/foo'] },
    teamSlug: payload.dataset.team_slug
  })
})

it('returns error from backend', async () => {
  const error = buildParsedError({ message: 'foo' })
  jest.spyOn(backend, 'deleteV2Items').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error.message).toEqual('foo')
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch)
    .toBeCalledWith('dataset/loadV2DatasetItemCountsThrottled', { dataset: payload.dataset })
})
