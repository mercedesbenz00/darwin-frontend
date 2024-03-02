import { createLocalVue, mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetDetailPayload, buildDatasetPayload } from 'test/unit/factories'

import { useWorkflowLoader } from './useWorkflowLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const dataset1 = buildDatasetPayload({ id: 1, version: 2 })
const dataset2 = buildDatasetPayload({ id: 2, version: 2 })

const mountComposition = (): ReturnType<typeof mount> => {
  return mount(
    {
      setup: () => useWorkflowLoader(),
      render: (h)  => h('div')
    },
    { localVue, store }
  )
}

beforeEach(() => {
  store = createTestStore()
  const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 2 })
  store.commit('dataset/SET_DATASETS', [dataset])
  const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
})

describe('no items', () => {
  it('joins on item change', async () => {
    mountComposition()
    store.commit('workview/SET_DATASET', dataset1)
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('workview/loadV2Workflows')
  })
})

describe('item already in store', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET', dataset1)
  })

  it('dispatches join on mount if item preselected', () => {
    mountComposition()
    expect(store.dispatch).toHaveBeenCalledWith('workview/loadV2Workflows')
  })

  it('reloads items on item change', async () => {
    mountComposition()
    store.commit('workview/SET_DATASET', dataset2)
    await flushPromises()
    expect(store.dispatch).toHaveBeenNthCalledWith(1, 'workview/loadV2Workflows')
    expect(store.dispatch).toHaveBeenNthCalledWith(2, 'workview/loadV2Workflows')
  })
})
