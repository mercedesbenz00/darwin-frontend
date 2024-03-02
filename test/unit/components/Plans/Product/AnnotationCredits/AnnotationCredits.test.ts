import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload
} from 'test/unit/factories'
import { EditProductLayout, ProductLayout } from 'test/unit/stubs'

import AnnotationCredits from '@/components/Plans/Product/AnnotationCredits/AnnotationCredits.vue'
import { installCommonComponents } from '@/plugins/components'
import { ProductType } from '@/store/modules/billing/types'
import { dateFromUtcISO } from '@/utils'

let localVue: ReturnType<typeof createLocalVue>
let store: ReturnType<typeof createTestStore>
let info: ReturnType<typeof buildBillingInfoPayload>
const periodEnd = Math.floor(
  dateFromUtcISO('2030-05-05T00:00:00').getTime() / 1000
)

// month earlier
const periodStart = periodEnd - (30 * 24 * 3600)

const model = {
  changeButton: 'primary-button-stub',
  editPlanModal: 'edit-plan-modal-stub',
  typeformModal: 'typeform-modal-stub',
  cancelPlanModal: 'cancel-plan-confirm-modal-stub'
}

beforeEach(() => {
  localVue = createLocalVue()
  installCommonComponents(localVue)
  localVue.use(Vuex)
  localVue.use(VueJSModal)

  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({
      stripe_subscription_period_end: periodEnd,
      stripe_subscription_period_start: periodStart
    }),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_standard_max_in_period_at: periodStart,
      annotation_credits_used: 111
    })
  })

  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', info)
})

const stubs = { EditProductLayout, 'lottie-animation': true, ProductLayout }

const itMatchesSnapshot = () => {
  it('matches snaphsot', async () => {
    const wrapper = shallowMount(AnnotationCredits, { localVue, store, stubs })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
}

itMatchesSnapshot()

describe('with bonus credits', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_bonus = 50
    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()
})

it('opens modal on button click', async () => {
  const wrapper = shallowMount(AnnotationCredits, { localVue, store })

  const spy = jest.spyOn(wrapper.vm.$modal, 'show')
  expect(spy).not.toHaveBeenCalled()

  await wrapper.find(model.changeButton).vm.$emit('click')
  expect(spy).toHaveBeenCalledWith(ProductType.AnnotationCredits)
})

it('opens typeform and then opens cancel plan confirmation modal for confirming', async () => {
  const wrapper = shallowMount(AnnotationCredits, { localVue, store })

  const modalShow = jest.spyOn(wrapper.vm.$modal, 'show')

  await wrapper.find(model.typeformModal).vm.$emit('submit')
  expect(modalShow).toHaveBeenCalledWith('cancel-plan-confirm-modal')
})
