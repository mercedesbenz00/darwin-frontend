import Vue from 'vue'

import store from '@/store'
import { CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import { billingInfo, partnerInfo, subscription } from '@/storybook/fixtures/billing'
import { partnerTeam, v7 } from '@/storybook/fixtures/teams'

import StorageSummary from './StorageSummary.vue'

const stories = {
  component: StorageSummary,
  title: 'Billing/Plans/StorageSummary',
  argTypes: {}
}

export default stories

type StoryConfig = { argTypes: typeof stories.argTypes }
type Args = Record<keyof typeof stories.argTypes, any>

export const Default = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { StorageSummary },
  props: Object.keys(argTypes),
  store,
  computed: {
    subscription: {
      get (): CustomerSubscriptionPayload {
        return {
          ...subscription!,
          storage_used: this.used,
          storage_standard_max_in_period: this.total
        }
      }
    }
  },
  mounted () {
    const store = this.$store
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  },
  template: '<storage-summary />'
})

Default.args = {
  used: 14769,
  total: 50000
}

export const Partner = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { StorageSummary },
  props: Object.keys(argTypes),
  store,
  mounted () {
    const store = this.$store
    store.commit('team/SET_CURRENT_TEAM', partnerTeam)
    store.commit('billing/SET_BILLING_INFO', partnerInfo)
  },
  template: '<storage-summary />'
})
