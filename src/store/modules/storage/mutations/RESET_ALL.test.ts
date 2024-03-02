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
  provider: 'aws',
  region: 'region',
  role: 'role'
}, {
  slug: 'slug_2',
  default: false,
  name: 'Slug 2',
  readonly: true,
  bucket: 'bucket',
  prefix: 'prefix',
  provider: 'aws',
  region: 'region',
  role: 'role'
}]

beforeEach(() => {
  store = createTestStore()
  store.state.storage.storages = {}
})

it('should reset the state', () => {
  store.commit('storage/SET_STORAGES', storages)
  store.commit('storage/RESET_ALL')
  expect(store.state.storage.storages).toStrictEqual({})
})
