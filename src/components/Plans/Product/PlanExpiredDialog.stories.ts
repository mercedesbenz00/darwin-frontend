import Vue from 'vue'

import Abilities from '@/plugins/abilities'
import router from '@/router'
import store from '@/store'
import { Ability } from '@/store/types'
import { billingInfo } from '@/storybook/fixtures/billing'
import { v7 } from '@/storybook/fixtures/teams'

import PlanExpiredDialog from './PlanExpiredDialog.vue'

const stories = {
  title: 'Billing/PlanExpiredDialog',
  argTypes: {}
}

const viewCustomersAbility: Ability = { subject: 'all', actions: ['view_customer'] }

type Args = Record<keyof typeof stories.argTypes, any>
type Opts = { argTypes: typeof stories.argTypes }

Vue.use(Abilities, store)

export const Default = (args: Args, { argTypes }: Opts) => Vue.extend({
  components: { PlanExpiredDialog },
  props: Object.keys(argTypes),
  store,
  router,

  beforeMount () {
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('billing/SET_BILLING_INFO', billingInfo)
    store.commit('auth/SET_ABILITIES', [viewCustomersAbility])
  },

  template: '<plan-expired-dialog ref="dialog" />'
})
