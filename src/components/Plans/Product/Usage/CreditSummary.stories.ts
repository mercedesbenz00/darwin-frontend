import Vue from 'vue'
import { Dispatch } from 'vuex'

import store from '@/store'
import { creditUsage, partnerCreditUsage } from '@/storybook/fixtures/billing'
import { partnerTeam, v7 } from '@/storybook/fixtures/teams'

import CreditUsage from './CreditSummary.vue'

const stories = {
  component: CreditUsage,
  title: 'Billing/Plans/CreditSummary',
  argTypes: {}
}

export default stories

type StoryConfig = { argTypes: typeof stories.argTypes }
type Args = Record<keyof typeof stories.argTypes, any>

export const Default = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { CreditUsage },
  props: Object.keys(argTypes),
  store,
  created () {
    store.dispatch = ((() => Promise.resolve({})) as unknown as Dispatch)
  },
  mounted () {
    const store = this.$store
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('billing/SET_CREDIT_USAGE', creditUsage)
  },
  template: '<credit-summary />'
})

export const Partner = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { CreditUsage },
  props: Object.keys(argTypes),
  store,
  created () {
    store.dispatch = ((() => Promise.resolve({})) as unknown as Dispatch)
  },
  mounted () {
    const store = this.$store
    store.commit('team/SET_CURRENT_TEAM', partnerTeam)
    store.commit('billing/SET_CREDIT_USAGE', partnerCreditUsage)
  },
  template: '<credit-summary />'
})
