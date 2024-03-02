import { createLocalVue } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: Store<RootState>

beforeEach(() => {
  store = createTestStore()
  store.commit('storage/SET_STORAGES', [{
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
  }])
})

it('storage/storages should return an array of storages', () => {
  expect(store.getters['storage/storages'].length).toBe(2)
})
