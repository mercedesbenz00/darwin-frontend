import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload } from 'test/unit/factories'

import ReadOnlyContextMenu from './ReadOnlyContextMenu.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const items = [
  buildDatasetItemPayload({ id: 1, seq: 1, dataset_id: 1 }),
  buildDatasetItemPayload({ id: 2, seq: 2, dataset_id: 1 }),
  buildDatasetItemPayload({ id: 3, seq: 3, dataset_id: 1 })
]

it('matches snapshot when nothing selected', () => {
  store.commit('dataset/SET_DATASET_ITEMS', items)
  const wrapper = shallowMount(ReadOnlyContextMenu, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with selection', () => {
  store.commit('dataset/SET_DATASET_ITEMS', items)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items: items.slice(0, 2), selected: true })
  const wrapper = shallowMount(ReadOnlyContextMenu, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})
