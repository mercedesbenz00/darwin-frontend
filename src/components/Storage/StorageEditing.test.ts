import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildStoragePayload
} from 'test/unit/factories/buildStoragePayload'

import StorageEditing from '@/components/Storage/StorageEditing.vue'
import loadingDirective from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'
import { StoragePayload } from '@/store/types'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(Vuex)
localVue.use(VueJSModal)
localVue.directive('loading', loadingDirective)

let store: ReturnType<typeof createTestStore>
let mocks: {
  $modal: {
    show: jest.Mock,
    hide: jest.Mock
  }
}
let propsData: {
  storage: StoragePayload
}
let storagePayload: ReturnType<typeof buildStoragePayload>

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    }
  }
  storagePayload = buildStoragePayload({})
  propsData = { storage: storagePayload }
})

it('matches snaphsot', () => {
  const wrapper = shallowMount(StorageEditing, { localVue, mocks, store, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('shows correct storage form according to provider type', () => {
  it('s3 provider', () => {
    const wrapper = shallowMount(StorageEditing, { localVue, mocks, store, propsData })
    expect(wrapper.find('aws-storage-form-stub').exists()).toBe(true)
  })
  it('gcp provider', () => {
    propsData = { storage: buildStoragePayload({ provider: 'gcp' }) }
    const wrapper = shallowMount(StorageEditing, { localVue, mocks, store, propsData })
    expect(wrapper.find('gcp-storage-form-stub').exists()).toBe(true)
  })
  it('azure provider', () => {
    propsData = { storage: buildStoragePayload({ provider: 'azure', tenant_id: 'tenant_id' }) }
    const wrapper = shallowMount(StorageEditing, { localVue, mocks, store, propsData })
    expect(wrapper.find('azure-storage-form-stub').exists()).toBe(true)
  })
  it('minio provider', () => {
    propsData = { storage: buildStoragePayload({ provider: 'minio', base_url: 'base_url' }) }
    const wrapper = shallowMount(StorageEditing, { localVue, mocks, store, propsData })
    expect(wrapper.find('minio-storage-form-stub').exists()).toBe(true)
  })
})

describe('on "submit"', () => {
  it('dispatches action', async () => {
    const wrapper = shallowMount(StorageEditing, { localVue, mocks, store, propsData })

    await wrapper.find('aws-storage-form-stub').vm.$emit('submitted', propsData.storage)
    expect(store.dispatch).toHaveBeenCalledWith('storage/updateStorage', propsData.storage)
  })

  it('dispatches toast on failure', async () => {
    const wrapper = shallowMount(StorageEditing, { localVue, mocks, store, propsData })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })

    await wrapper.find('aws-storage-form-stub').vm.$emit('submitted', propsData.storage)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })
})
