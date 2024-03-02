import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'
import PlanExpiredDialog from '@/components/Plans/Product/PlanExpiredDialog.vue'
import { installCommonComponents } from '@/plugins/components'
import { StripeSubscriptionStatus } from '@/store/modules/billing/types'
import { unixNowSeconds } from '@/utils'

let store: ReturnType<typeof createTestStore>
let billingInfo: ReturnType<typeof buildBillingInfoPayload>
let mocks: {
  $can: Function,
  $modal: { show: Function, hide: Function },
  $route: { name: string, params: Object, query: Object },
  $theme: ReturnType<typeof createMockTheme>
}

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

installCommonComponents(localVue)

const stubs: Stubs = {
  // unstub the layout, so it's visible which slots were used
  // more reliable than a custom stub with custom slots
  ConfirmationDialogLayout
}

const periodEnd = unixNowSeconds() + 11 * 24 * 3600

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ name: 'V7' }))

  billingInfo = buildBillingInfoPayload({
    customer: buildCustomerPayload({
      stripe_subscription_period_end: periodEnd
    }),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_used: 20,
      locked_out_reasons: [],
      locked_out: false,
      seconds_per_automation_action: 36,
      storage_standard: 1000,
      storage_used: 900
    })
  })

  mocks = {
    $can: () => true,
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    },
    $route: {
      name: 'Datasets',
      params: {},
      query: {}
    },
    $theme: createMockTheme()
  }
})

it('matches snapshot', async () => {
  store.commit('billing/SET_BILLING_INFO', billingInfo)
  const wrapper = shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('renders nothing when not team owner', async () => {
  store.commit('billing/SET_BILLING_INFO', billingInfo)
  mocks.$can = () => false
  const wrapper = shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
  await flushPromises()
  expect(wrapper.html()).toEqual('')
})

describe('with active subscription', () => {
  beforeEach(() => {
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  it('never opens the dialog', async () => {
    shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
    await flushPromises()
    expect(mocks.$modal.show).not.toBeCalled()
  })
})

describe('no credits subscribed', () => {
  beforeEach(() => {
    billingInfo.customer.stripe_subscription_status = StripeSubscriptionStatus.Trialing
    billingInfo.customer_subscription!.annotation_credits_bonus = 20
    billingInfo.customer_subscription!.annotation_credits_used = 20
    billingInfo.customer_subscription!.annotation_credits_standard = 0
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  it('opens the dialog', async () => {
    shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
    await flushPromises()
    expect(mocks.$modal.show).toBeCalled()
  })

  it('opens the dialog if settings query param is specified though', async () => {
    mocks.$route.query = { settings: 'plans' }
    shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
    await flushPromises()
    expect(mocks.$modal.show).toBeCalled()
  })
})

describe('active sub, out of credits', () => {
  beforeEach(() => {
    billingInfo.customer.stripe_subscription_status = StripeSubscriptionStatus.Active
    billingInfo.customer_subscription!.annotation_credits_bonus = 20
    billingInfo.customer_subscription!.annotation_credits_used = 130
    billingInfo.customer_subscription!.annotation_credits_standard = 100
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  it('never opens dialog', async () => {
    shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
    await flushPromises()
    expect(mocks.$modal.show).not.toBeCalled()
  })
})

describe('current team changes', () => {
  beforeEach(() => {
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  it('trigger loading billing information again', async () => {
    shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('billing/loadBillingInfo')
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 2, name: 'V7-2' }))
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('billing/loadBillingInfo')
  })
})

it('toggles UI', async () => {
  const wrapper = shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
  await emitRootStub(wrapper, 'before-open')
  expect(store.dispatch).not.toHaveBeenCalledWith('ui/putBackSidebar')
})

it('toggles UI on close', async () => {
  const wrapper = shallowMount(PlanExpiredDialog, { localVue, mocks, store, stubs })
  await emitRootStub(wrapper, 'closed')
  expect(store.dispatch).not.toHaveBeenCalledWith('ui/bringFrontSidebar')
})
