import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetPayload } from 'test/unit/factories'

import { restoreV2DatasetItems } from '@/store/modules/dataset/actions/restoreV2DatasetItems'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ restoreV2Items: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'dataset/restoreV2DatasetItems'

const payload: Parameters<typeof restoreV2DatasetItems>[1] = {
  dataset: buildDatasetPayload({ id: 5 }),
  filters: { item_paths: ['/foo'] }
}

beforeEach(() => {
  jest.spyOn(backend, 'restoreV2Items').mockResolvedValue(buildAxiosResponse({ data: null }))

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
  expect(backend.restoreV2Items).toHaveBeenCalledWith({
    teamSlug: payload.dataset.team_slug,
    filters: { dataset_ids: [5], item_paths: ['/foo'] }
  })
})

it('returns error from backend', async () => {
  const error = { error: { message: 'foo', isValidationError: false } }
  jest.spyOn(backend, 'restoreV2Items').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error).toEqual(error.error)
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch)
    .toBeCalledWith('dataset/loadV2DatasetItemCountsThrottled', { dataset: payload.dataset })
})
