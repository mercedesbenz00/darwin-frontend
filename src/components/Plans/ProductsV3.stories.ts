import Vue from 'vue'
import { Dispatch } from 'vuex'

import store, { resetStore } from '@/store'
import { BillingInfoPayload, StripeSubscriptionStatus } from '@/store/modules/billing/types'
import { billingInfo, creditUsage } from '@/storybook/fixtures/billing'

import ProductsV3 from './ProductsV3.vue'

const stories = {
  component: ProductsV3,
  title: 'Billing/Plans/ProductsV3',
  argTypes: {
    standard: { control: { type: 'number', step: 50 } },
    bonus: { control: { type: 'number', step: 5 } },
    trialing: { control: { type: 'boolean' } }
  }
}

export default stories

type StoryConfig = { argTypes: typeof stories.argTypes }
type Args = Record<keyof typeof stories.argTypes, any>

export const Default = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { ProductsV3 },
  props: Object.keys(argTypes),
  watch: {
    standard () {
      this.setInfo()
    },
    bonus () {
      this.setInfo()
    },
    trialing () {
      this.setInfo()
    }
  },
  created () {
    store.dispatch = ((() => Promise.resolve({})) as unknown as Dispatch)
    // need to set initial info on creation, or we get console errors
    resetStore()
    store.commit('billing/SET_CREDIT_USAGE', creditUsage)
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  },
  mounted () {
    this.setInfo()
  },
  methods: {
    /**
     * set info from props given by storybook controls for standard and bonus credits
     */
    setInfo () {
      if (!billingInfo.customer_subscription) { throw new Error('Invalid billingInfo fixture') }

      const newBillingInfo: BillingInfoPayload = {
        ...billingInfo,
        customer: {
          ...billingInfo.customer,
          stripe_subscription_status: this.trialing
            ? StripeSubscriptionStatus.Trialing
            : StripeSubscriptionStatus.Active
        },
        customer_subscription: {
          ...billingInfo.customer_subscription,
          annotation_credits_standard: this.standard,
          annotation_credits_bonus: this.bonus
        }
      }

      store.commit('billing/SET_BILLING_INFO', newBillingInfo)
    }
  },
  store,
  template: '<products-v3 @billing-error="() => {}" />'
})

Default.args = {
  standard: 100,
  bonus: 50,
  trialing: false
}
