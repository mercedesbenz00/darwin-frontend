import Vue from 'vue'

import { BillingInfoPayload } from '@/store/modules/billing/types'
import { slider } from '@/storybook/controls/slider'
import { billingInfo, partnerInfo } from '@/storybook/fixtures/billing'

import StorageBar from './StorageBar.vue'

const stories = {
  component: StorageBar,
  title: 'Billing/Plans/StorageBar',
  argTypes: {
    used: slider(0, 100000, 1),
    total: slider(0, 100000, 1)
  }
}

export default stories

type StoryConfig = { argTypes: typeof stories.argTypes }
type Args = Record<keyof typeof stories.argTypes, any>

export const Interactive = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { StorageBar },
  props: Object.keys(argTypes),
  computed: {
    modifiableInfo: {
      get (): BillingInfoPayload {
        return {
          ...billingInfo,
            customer_subscription: {
            ...billingInfo.customer_subscription,
            storage_used: this.used,
            storage_standard_max_in_period: this.total
          }
        }
      }
    }
  },
  template: '<storage-bar :billing-info="modifiableInfo" />'
})

Interactive.args = {
  used: 14700,
  total: 50000
}

const lowStorageInfo = {
  ...billingInfo,
  customer_subscription: {
    ...billingInfo.customer_subscription,
    storage_used: 40000,
    storage_standard_max_in_period: 50000
  }
}

export const LowStorage = () => Vue.extend({
  components: { StorageBar },
  data: () => ({ billingInfo: lowStorageInfo }),
  template: '<storage-bar :billing-info="billingInfo" />'
})

const noStorageInfo = {
  ...billingInfo,
  customer_subscription: {
    ...billingInfo.customer_subscription,
    storage_used: 50000,
    storage_standard_max_in_period: 50000
  }
}

export const NoStorage = () => Vue.extend({
  components: { StorageBar },
  data: () => ({ billingInfo: noStorageInfo }),
  template: '<storage-bar :billing-info="billingInfo" />'
})

export const Partner = () => Vue.extend({
  components: { StorageBar },
  data: () => ({ billingInfo: partnerInfo }),
  template: '<storage-bar :billing-info="billingInfo" />'
})
