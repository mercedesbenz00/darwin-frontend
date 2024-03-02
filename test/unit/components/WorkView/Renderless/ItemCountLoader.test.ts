import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { VueConstructor } from 'vue/types/umd'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetDetailPayload, buildDatasetPayload } from 'test/unit/factories'

import ItemCountLoader from '@/components/WorkView/Renderless/ItemCountLoader'

let localVue: VueConstructor<Vue>

const sfh = buildDatasetDetailPayload({ id: 1 })

let store: ReturnType<typeof createTestStore>
let mocks: {
  $route: { query: { dataset?: string, image?: string }}
}

beforeEach(() => {
  localVue = createLocalVue()
  localVue.use(Vuex)

  store = createTestStore()
  store.commit('workview/SET_DATASET', sfh)

  mocks = { $route: { query: { } } }
})

it('loads counts on dataset change, filter change', async () => {
  shallowMount(ItemCountLoader, { localVue, mocks, store })

  store.commit('workview/SET_DATASET', buildDatasetPayload())
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledTimes(1)

  store.commit('workview/SET_DATASET_ITEMS_FILTER', { page: 2 })
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledTimes(2)
})
