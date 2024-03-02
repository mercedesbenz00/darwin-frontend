<template>
  <team-section class="stripe">
    <template #title>
      Stripe
    </template>
    <template #body>
      <team-section-field full-width>
        <template #label>
          Subscription status
        </template>
        <template #value>
          {{ status }}
        </template>
      </team-section-field>
      <team-section-field full-width>
        <template #label>
          Subscription current period
        </template>
        <template #value>
          {{ periodStart }}-{{ periodEnd }}
        </template>
      </team-section-field>
      <team-section-field>
        <template #value>
          <positive-button
            tag="a"
            :href="stripeCustomerUri"
            target="_blank"
          >
            Manage customer on stripe
          </positive-button>
        </template>
      </team-section-field>
      <team-section-field>
        <template #value>
          <positive-button
            tag="a"
            :href="stripeSubscriptionUri"
            target="_blank"
          >
            Manage subscription on stripe
          </positive-button>
        </template>
      </team-section-field>
      <team-section-field>
        <template #value>
          <positive-button
            tag="a"
            :href="stripeUpcomingInvoiceUri"
            target="_blank"
          >
            View next invoice on stripe
          </positive-button>
        </template>
      </team-section-field>
    </template>
  </team-section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { TeamPayload } from '@/store/modules/admin/types'
import { StripeSubscriptionStatus } from '@/store/modules/billing/types'
import { formatUnixDate } from '@/utils'

import TeamSection from './TeamSection.vue'
import TeamSectionField from './TeamSectionField.vue'

@Component({
  name: 'stripe',
  components: { TeamSection, TeamSectionField }
})
export default class Stripe extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  get stripeCustomerUri () {
    const { stripe_id: id } = this.team
    return `https://dashboard.stripe.com/customers/${id}`
  }

  get stripeSubscriptionUri () {
    const { subscription_id: subscriptionId } = this.team
    return `https://dashboard.stripe.com/subscriptions/${subscriptionId}`
  }

  get stripeUpcomingInvoiceUri () {
    const { stripe_id: customerId, subscription_id: subscriptionId } = this.team
    return `https://dashboard.stripe.com/customers/${customerId}/upcoming_invoice/${subscriptionId}`
  }

  get periodStart (): string | null {
    const { team: { subscription_period_start: periodStart } } = this
    return periodStart ? formatUnixDate(periodStart, 'DD/MM/YY') : null
  }

  get periodEnd (): string | null {
    const { team: { subscription_period_end: periodEnd } } = this
    return periodEnd ? formatUnixDate(periodEnd, 'DD/MM/YY') : null
  }

  get status (): StripeSubscriptionStatus | 'unknown' {
    const { team: { subscription_status: status } } = this
    return status || 'unknown'
  }
}
</script>
