import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { loadV2DatasetItemsList } from '@/store/modules/dataset/actions/loadV2DatasetItemsList'
import { StoreActionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'dataset/loadV2DatasetItemsListThrottled'
const BASE_ACTION = 'dataset/loadV2DatasetItemsList'

const payload: StoreActionPayload<typeof loadV2DatasetItemsList> = {
  datasetId: 1,
  teamSlug: 'vy',
  filter: {}
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
