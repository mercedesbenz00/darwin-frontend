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

const MUTATION = 'dataset/MOVE_SELECTED_ITEMS_TO_PATH'

let items: DatasetItemPayload[]
beforeEach(() => {
  items = [
    buildDatasetItemPayload({ id: 1, path: '/' }),
    buildDatasetItemPayload({ id: 2, path: '/' })
  ]

  store.commit('dataset/ADD_DATASET_ITEMS', items)
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
})

it('does nothing if not in folder view', () => {
  store.commit('dataset/SET_FOLDER_ENABLED', false)
  store.commit(MUTATION, '/foo')

  expect(store.state.dataset.datasetItems).toEqual(items)
})

it('clears out all items if they are filtered by path', () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)

  store.commit(MUTATION, '/foo')
  expect(store.state.dataset.datasetItems).toEqual([])
})

it('clears out specified items if they are filtered by path', () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [items[0]], selected: true })
  store.commit('dataset/SET_FOLDER_ENABLED', true)

  store.commit(MUTATION, '/foo')
  expect(store.state.dataset.datasetItems).toEqual([items[1]])
})
