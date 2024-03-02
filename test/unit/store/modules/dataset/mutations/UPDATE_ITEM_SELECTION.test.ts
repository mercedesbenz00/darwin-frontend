import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload } from 'test/unit/factories'

import { DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'dataset/UPDATE_ITEM_SELECTION'

let items: DatasetItemPayload[]

beforeEach(() => {
  items = [
    buildDatasetItemPayload({ id: 1 }),
    buildDatasetItemPayload({ id: 2 }),
    buildDatasetItemPayload({ id: 3 })
  ]

  store.commit('dataset/ADD_DATASET_ITEMS', items)
})

it('sets selection on specified items', () => {
  store.commit(MUTATION, { items: [items[0], items[1]], selected: true })
  expect(store.state.dataset.selectedItemIds).toEqual([1, 2])

  store.commit(MUTATION, { items: [items[1], items[2]], selected: false })
  expect(store.state.dataset.selectedItemIds).toEqual([1])
})
