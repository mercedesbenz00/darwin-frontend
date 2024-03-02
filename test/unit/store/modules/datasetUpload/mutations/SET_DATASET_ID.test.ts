import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('sets "datasetId"', () => {
  store.commit('datasetUpload/SET_DATASET_ID', 2)
  expect(store.state.datasetUpload.datasetId).toEqual(2)
})
