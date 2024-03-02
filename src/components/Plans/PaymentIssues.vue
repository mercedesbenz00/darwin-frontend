<template>
  <div
    v-if="issues.length > 0"
    class="issues"
  >
    <div
      v-for="(issue, index) in issues"
      :key="index"
      class="issues__issue"
    >
      {{ issue }}
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { BillingInfoPayload, StripeSubscriptionStatus } from '@/store/modules/billing/types'

/**
 * Used to render payment/subscription issues for a customer in a self-contained
 * way.
 *
 * Currently only render a message if the customer subscription status is one of
 * the problematic statuses, but it implemented in such a way that it could
 * potentially be expanded with more messages.
 */
@Component({ name: 'payment-issues' })
export default class PaymentIssues extends Vue {
  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  get issues (): string[] {
    if (!this.billingInfo) { return [] }

    const status = this.billingInfo.customer.stripe_subscription_status

    const badStatuses: StripeSubscriptionStatus[] = [
      StripeSubscriptionStatus.Unpaid,
      StripeSubscriptionStatus.IncompleteExpired,
      StripeSubscriptionStatus.PastDue
    ]

    return (!!status && badStatuses.includes(status))
      ? ['Billing Status: Payment failed - Update payment details or contact your bank.']
      : []
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.issues__issue {
  color: $colorPink;
}
</style>
