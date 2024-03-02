import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('sets upload status to "started"', () => {
  store.commit('datasetUpload/SET_UPLOAD_STATUS', 'started')
  expect(store.state.datasetUpload.status).toEqual('started')
})

it('sets upload status to "stopped"', () => {
  store.commit('datasetUpload/SET_UPLOAD_STATUS', 'stopped')
  expect(store.state.datasetUpload.status).toEqual('stopped')
})
