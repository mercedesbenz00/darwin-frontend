import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetFolderPayload } from 'test/unit/factories'

import { currentPathFolders } from '@/store/modules/dataset/getters/currentPathFolders'
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
  state.datasetFolders = [
    buildDatasetFolderPayload({ path: '/' }),
    buildDatasetFolderPayload({ path: '/root' })
  ]
  rootState = store.state
})

describe('currentPathFolders', () => {
  it('returns non-treefied folders under current path', () => {
    const folders = currentPathFolders(state, getters, rootState, rootGetters)
    expect(folders).toHaveLength(1)
    expect(folders).toEqual([expect.objectContaining({ path: '/root' })])
  })
})
