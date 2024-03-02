import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { createFile } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const files = [1, 2, 3].map(i => i.toString()).map((val) => createFile(val))

beforeEach(() => {
  store = createTestStore()
})

it('sets upload status to "stopped"', () => {
  store.commit('datasetUpload/STOP_UPLOAD')
  expect(store.state.datasetUpload.status).toEqual('stopped')
})

it('clears files from state', () => {
  store.commit('datasetUpload/ADD_FILES', files)

  store.commit('datasetUpload/STOP_UPLOAD', 'stopped')
  expect(store.state.datasetUpload.files).toEqual([])
})
