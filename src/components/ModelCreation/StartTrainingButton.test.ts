import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildModelTemplatePayload,
  buildTeamPayload
} from 'test/unit/factories'
import { flask } from 'test/unit/fixtures/annotation-class-payloads'
import { emitRootStub } from 'test/unit/testHelpers'

import StartTrainingButton from '@/components/ModelCreation/StartTrainingButton.vue'
import { installCommonComponents } from '@/plugins/components'
import { StripeSubscriptionStatus } from '@/store/modules/billing/types'
import { unixNowSeconds } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let billingInfo: ReturnType<typeof buildBillingInfoPayload>

let mocks: {
  $router: { push: jest.Mock }
}
const periodStart = unixNowSeconds() - 11 * 24 * 3600
const periodEnd = unixNowSeconds() + 11 * 24 * 3600

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ name: 'V7' }))

  billingInfo = buildBillingInfoPayload({
    customer: buildCustomerPayload({
      stripe_subscription_period_end: periodEnd,
      stripe_subscription_period_start: periodStart
    }),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard_max_in_period_at: periodStart + 1,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_standard: 100,
      annotation_credits_used: 20,
      locked_out_reasons: [],
      locked_out: false,
      storage_standard: 1000,
      storage_used: 900
    })
  })

  mocks = {
    $router: { push: jest.fn() }
  }
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(StartTrainingButton, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when data missing', () => {
  beforeEach(() => {
    store.commit('neuralModel/VALIDATE_NEW_MODEL')
  })

  itMatchesSnapshot()

  it('renders as disabled', () => {
    const wrapper = shallowMount(StartTrainingButton, { localVue, store })
    expect(wrapper.attributes('disabled')).toBeTruthy()
  })
})

describe('when data valid and has no available credits', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', buildDatasetPayload())
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [flask])
    store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [buildDatasetItemPayload({ id: 1 })])
    store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', buildModelTemplatePayload({ id: 'foo' }))
    store.commit('neuralModel/VALIDATE_NEW_MODEL')

    billingInfo.customer.stripe_subscription_status = StripeSubscriptionStatus.Trialing
    billingInfo.customer_subscription!.annotation_credits_bonus = 20
    billingInfo.customer_subscription!.annotation_credits_used = 20
    billingInfo.customer_subscription!.annotation_credits_standard = 0
    billingInfo.customer_subscription!.annotation_credits_standard_max_in_period = 0
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  itMatchesSnapshot()

  it('renders as disabled', () => {
    const wrapper = shallowMount(StartTrainingButton, { localVue, store })
    expect(wrapper.attributes('disabled')).toBeTruthy()
  })
})

describe('when data valid and has credits', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', buildDatasetPayload())
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [flask])
    store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [buildDatasetItemPayload({ id: 1 })])
    store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', buildModelTemplatePayload({ id: 'foo' }))
    store.commit('neuralModel/VALIDATE_NEW_MODEL')

    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  itMatchesSnapshot()

  it('dispatches action', () => {
    const wrapper = shallowMount(StartTrainingButton, { localVue, store, mocks })
    emitRootStub(wrapper, 'click')
    expect(store.dispatch).toHaveBeenCalledWith('neuralModel/trainModel')
  })

  it('redirects to different route when done', async () => {
    const wrapper = shallowMount(StartTrainingButton, { localVue, store, mocks })
    emitRootStub(wrapper, 'click')
    await flushPromises()
    expect(mocks.$router.push).toHaveBeenLastCalledWith('/models')
  })

  it('dispatches toast on validation error', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { isValidationError: true } })
    const wrapper = shallowMount(StartTrainingButton, { localVue, store, mocks })
    emitRootStub(wrapper, 'click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenLastCalledWith('toast/warning', {
      content: expect.anything()
    })
  })

  it('dispatches toast on non-validation error', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'foo' } })
    const wrapper = shallowMount(StartTrainingButton, { localVue, store, mocks })
    emitRootStub(wrapper, 'click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenLastCalledWith('toast/warning', {
      content: 'foo'
    })
  })

  it('renders as enabled', () => {
    const wrapper = shallowMount(StartTrainingButton, { localVue, store })
    expect(wrapper.attributes('disabled')).toBeFalsy()
  })
})
