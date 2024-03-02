import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload
} from 'test/unit/factories'
import {
  buildStoragePayload
} from 'test/unit/factories/buildStoragePayload'

import StorageCreation from '@/components/Storage/StorageCreation.vue'
import loadingDirective from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(Vuex)
localVue.use(VueJSModal)
localVue.directive('loading', loadingDirective)

const model = {
  storageCreationButton: '.creation__btn secondary-button-stub',
  awsStorageForm: 'aws-storage-form-stub'
}

const billingInfo = buildBillingInfoPayload({})

let store: ReturnType<typeof createTestStore>
let mocks: {
  $modal: {
    show: jest.Mock,
    hide: jest.Mock
  }
}

let info: ReturnType<typeof buildBillingInfoPayload>

beforeEach(() => {
  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', billingInfo)
  mocks = {
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    }
  }
  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({}),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_used: 111
    })
  })
})

const itMatchesSnapshot = (): void => {
  it('matches snaphsot', async () => {
    const wrapper = shallowMount(StorageCreation, { localVue, mocks, store })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when there is no allowed buckets', () => {
  beforeEach(() => {
    info.customer_subscription!.external_storage_buckets = 0
    info.customer_subscription!.external_storage_buckets_used = 0
    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()

  it('"New Storage Integration" buttion should to be disabled', async () => {
    const wrapper = shallowMount(StorageCreation, { localVue, mocks, store })
    await wrapper.vm.$nextTick()
    expect(wrapper.find(model.storageCreationButton).attributes('disabled')).toBeTruthy()
  })
})

describe('when there are some allowed buckets', () => {
  beforeEach(() => {
    info.customer_subscription!.external_storage_buckets = 10
    info.customer_subscription!.external_storage_buckets_used = 5

    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()

  it('"New Storage Integration" buttion should to be enabled', async () => {
    const wrapper = shallowMount(StorageCreation, { localVue, mocks, store })
    await wrapper.vm.$nextTick()
    expect(wrapper.find(model.storageCreationButton).attributes('disabled')).toBeFalsy()
  })
})

describe('on "New Storage Integration"', () => {
  beforeEach(() => {
    info.customer_subscription!.external_storage_buckets = 10
    info.customer_subscription!.external_storage_buckets_used = 5
    info.customer_subscription!.annotation_credits_standard = 3500
    info.customer_subscription!.annotation_credits_standard_max_in_period = 3500

    store.commit('billing/SET_BILLING_INFO', info)
  })
  it('shows storage creation modal', async () => {
    const wrapper = shallowMount(StorageCreation, { localVue, mocks, store })
    await wrapper.find(model.storageCreationButton).vm.$emit('click')
    expect(wrapper.vm.$modal.show).toBeCalledWith('new-storage')
  })
})

describe('on "submit"', () => {
  it('dispatches action', async () => {
    const wrapper = shallowMount(StorageCreation, { localVue, mocks, store })

    await wrapper.find(model.awsStorageForm).vm.$emit('submitted', buildStoragePayload({}))
    expect(store.dispatch).toHaveBeenCalledWith('storage/addStorage', buildStoragePayload({}))
  })

  it('dispatches toast on failure', async () => {
    const wrapper = shallowMount(StorageCreation, { localVue, mocks, store })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })

    await wrapper.find(model.awsStorageForm).vm.$emit('submitted', buildStoragePayload({}))
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })
})
