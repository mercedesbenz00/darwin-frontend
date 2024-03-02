import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemFilter } from 'test/unit/factories'

import { datasetItemApiFilter } from '@/store/modules/dataset/getters/datasetItemApiFilter'
import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

const localVue = createLocalVue()
localVue.use(Vuex)

let state: DatasetState
const getters = { currentPath: '/root' }
let rootState: RootState
const rootGetters = {}

const allStatuses = [
  DatasetItemStatus.annotate,
  DatasetItemStatus.complete,
  DatasetItemStatus.error,
  DatasetItemStatus.new,
  DatasetItemStatus.processing,
  DatasetItemStatus.review,
  DatasetItemStatus.uploading
]

beforeEach(() => {
  const store = createTestStore()
  state = store.state.dataset
  state.folderEnabled = false
  rootState = store.state
})

describe('datasetItemApiFilter', () => {
  it('returns all statuses', () => {
    state.datasetItemFilter = buildDatasetItemFilter({
      statuses: [],
      not_statuses: []
    })
    const filters = datasetItemApiFilter(state, getters, rootState, rootGetters)
    expect(filters).toEqual(expect.objectContaining({ statuses: allStatuses }))
  })

  it('returns path when folder is enabled', () => {
    state.folderEnabled = true
    state.datasetItemFilter = buildDatasetItemFilter({
      annotation_class_ids: [1, 2],
      path: '/root',
      statuses: [DatasetItemStatus.annotate]
    })
    const filters = datasetItemApiFilter(state, getters, rootState, rootGetters)
    expect(filters).toEqual(expect.objectContaining({ path: '/root' }))
  })

  it('returns default filter when folder is disabled and statuses are not empty', () => {
    state.datasetItemFilter = buildDatasetItemFilter({
      annotation_class_ids: [1, 2],
      statuses: [DatasetItemStatus.annotate]
    })
    const filters = datasetItemApiFilter(state, getters, rootState, rootGetters)
    expect(filters).toEqual(expect.objectContaining({ annotation_class_ids: [1, 2] }))
  })
})
