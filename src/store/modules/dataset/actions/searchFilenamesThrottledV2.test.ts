import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { searchFilenamesV2 } from '@/store/modules/dataset/actions/searchFilenamesV2'
import { StoreActionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'dataset/searchFilenamesThrottledV2'
const BASE_ACTION = 'dataset/searchFilenamesV2'

const payload: StoreActionPayload<typeof searchFilenamesV2> = {
  datasetId: 1,
  teamSlug: 'test',
  search: 'keyword'
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
