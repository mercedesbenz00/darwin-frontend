import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetPayload, buildAxiosResponse, buildParsedError } from 'test/unit/factories'

import { addPriorityToV2Items } from '@/store/modules/dataset/actions/addPriorityToV2Items'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ addPriorityToV2Items: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'dataset/addPriorityToV2Items'

const payload: Parameters<typeof addPriorityToV2Items>[1] = {
  dataset: buildDatasetPayload({ id: 5 }),
  priority: 3,
  filters: { item_paths: ['/'] }
}

beforeEach(() => {
  jest.spyOn(backend, 'addPriorityToV2Items').mockResolvedValue(buildAxiosResponse({ data: null }))

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
  expect(backend.addPriorityToV2Items).toHaveBeenCalledWith({
    filters: { dataset_ids: [5], item_paths: ['/'] },
    priority: 3,
    teamSlug: payload.dataset.team_slug
  })
})

it('returns error from backend', async () => {
  jest.spyOn(backend, 'addPriorityToV2Items')
    .mockResolvedValue(buildParsedError({ message: 'foo' }))
  const response = await store.dispatch(ACTION, payload)
  expect(response.error.message).toEqual('foo')
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch).toBeCalledWith(
    'dataset/loadV2DatasetItemCountsThrottled', { dataset: payload.dataset }
  )
})
