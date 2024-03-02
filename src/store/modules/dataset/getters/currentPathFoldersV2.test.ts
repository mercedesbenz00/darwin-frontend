import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2DatasetFolderPayload } from 'test/unit/factories'

import { currentPathFoldersV2 } from '@/store/modules/dataset/getters/currentPathFoldersV2'
import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let state: DatasetState
const getters = { currentPathV2: '/root' }
let rootState: RootState
const rootGetters = {}

beforeEach(() => {
  const store = createTestStore()
  state = store.state.dataset
  state.datasetFoldersV2 = [
    buildV2DatasetFolderPayload({ path: '/' }),
    buildV2DatasetFolderPayload({ path: '/root' })
  ]
  rootState = store.state
})

describe('currentPathFolders', () => {
  it('returns non-treefied folders under current path', () => {
    const folders = currentPathFoldersV2(state, getters, rootState, rootGetters)
    expect(folders).toHaveLength(1)
    expect(folders).toEqual([expect.objectContaining({ path: '/root' })])
  })
})
