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

const MUTATION = 'dataset/SET_SELECTED_ALL_ITEMS'

let items: DatasetItemPayload[]

beforeEach(() => {
  items = [
    buildDatasetItemPayload({ id: 1 }),
    buildDatasetItemPayload({ id: 2 }),
    buildDatasetItemPayload({ id: 3 })
  ]

  store.commit('dataset/ADD_DATASET_ITEMS', items)
})

it('sets selectedAll flag', () => {
  store.commit(MUTATION, true)
  expect(store.state.dataset.selectedAll).toEqual(true)

  store.commit(MUTATION, false)
  expect(store.state.dataset.selectedAll).toEqual(false)
})

it('deselects inndividual items when deselecting all', () => {
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })
  expect(store.state.dataset.selectedItemIds.length).toEqual(3)
  store.commit(MUTATION, false)
  expect(store.state.dataset.selectedItemIds.length).toEqual(0)
})

it('selects all individual items when selecting all', () => {
  expect(store.state.dataset.selectedItemIds.length).toEqual(0)
  store.commit(MUTATION, true)
  expect(store.state.dataset.selectedItemIds.length).toEqual(3)
})
