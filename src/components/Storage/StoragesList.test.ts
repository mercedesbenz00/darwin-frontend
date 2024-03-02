import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload
} from 'test/unit/factories'
import {
  buildStoragePayload
} from 'test/unit/factories/buildStoragePayload'

import StoragesList from '@/components/Storage/StoragesList.vue'
import loadingDirective from '@/directives/loading'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', loadingDirective)

const billingInfo = buildBillingInfoPayload({})

let store: ReturnType<typeof createTestStore>
let mocks: {
  $can: Function,
  $modal: {
    show: jest.Mock,
    hide: jest.Mock
  }
}

beforeEach(() => {
  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', billingInfo)
  mocks = {
    $can: jest.fn().mockImplementation(() => {
      return true
    }),
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    }
  }
})

it('matches snapshot', () => {
  store.commit('storage/SET_STORAGES', [
    buildStoragePayload({ slug: 'slug_1', name: 'Slug 1' }),
    buildStoragePayload({ slug: 'slug_2', name: 'Slug 2' })
  ])
  const wrapper = shallowMount(StoragesList, { localVue, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when storage list is empty', () => {
  store.commit('storage/SET_STORAGES', [])

  const wrapper = shallowMount(StoragesList, { localVue, store, mocks })
  expect(wrapper).toMatchSnapshot()
})
