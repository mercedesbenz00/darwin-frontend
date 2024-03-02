import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'dataset/SET_EXPORT_COMPLETE_COUNT'

it('sets the exportCompleteCount state value', () => {
  store.commit(MUTATION, 10)
  expect(store.state.dataset.exportCompleteCount).toEqual(10)
})
