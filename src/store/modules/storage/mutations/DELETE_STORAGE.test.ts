import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { StoragePayload } from '@/store/types/StoragePayload'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const storages: StoragePayload[] = [{
  slug: 'slug_1',
  default: false,
  name: 'Slug 1',
  readonly: true,
  bucket: 'bucket',
  prefix: 'prefix',
  region: 'region',
  provider: 'aws',
  role: 'role'
}, {
  slug: 'slug_2',
  default: false,
  name: 'Slug 2',
  readonly: true,
  bucket: 'bucket',
  prefix: 'prefix',
  region: 'region',
  provider: 'aws',
  role: 'role'
}]

beforeEach(() => {
  store = createTestStore()
  store.state.storage.storages = {}
})

it('should delete storage from the list', () => {
  store.commit('storage/SET_STORAGE', storages[0])
  expect(store.state.storage.storages.slug_1).toBe(storages[0])
  store.commit('storage/DELETE_STORAGE', storages[0].slug)
  expect(store.state.storage.storages.slug_1).toBeUndefined()
})
