import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import { loadV2DatasetItemCounts } from '@/store/modules/dataset/actions/loadV2DatasetItemCounts'
import { StoreActionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'dataset/loadV2DatasetItemCountsThrottled'
const BASE_ACTION = 'dataset/loadV2DatasetItemCounts'

const payload: StoreActionPayload<typeof loadV2DatasetItemCounts> = {
  dataset: buildDatasetPayload()
}

beforeEach(() => {
  store = createUnstubbedTestStore()

  const { dispatch } = store

  const mockDispatch = jest.fn().mockImplementation((action, payload) => {
    if (action === BASE_ACTION) { return { data: [] } }
    if (action === ACTION) { return dispatch(action, payload) }

    throw new Error('Unsupported action')
  })

  store.dispatch = mockDispatch
})

it('delegates to base action', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch).toHaveBeenCalledWith(BASE_ACTION, payload)
})
