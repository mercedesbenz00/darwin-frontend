import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetFolderPayload } from 'test/unit/factories'

import { currentPathFolder } from '@/store/modules/dataset/getters/currentPathFolder'
import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let state: DatasetState
const getters = { currentPath: '/root' }
let rootState: RootState
const rootGetters = {}

beforeEach(() => {
  const store = createTestStore()
  state = store.state.dataset
  state.datasetTreefiedFolders = [
    buildDatasetFolderPayload({
      path: '/',
      children: [buildDatasetFolderPayload({ path: '/root' })]
    })
  ]
  rootState = store.state
})

describe('currentPathFolder', () => {
  it('returns treefied folder under current path', () => {
    const folder = currentPathFolder(state, getters, rootState, rootGetters)
    expect(folder).toEqual(expect.objectContaining({ path: '/root' }))
  })
})
