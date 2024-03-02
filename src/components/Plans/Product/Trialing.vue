<template>
  <div
    v-if="trialing"
    class="trialing"
  >
    <div class="trialing__title">
      Free Trial
    </div>
    <div class="trialing__subtitle">
      {{ daysLeftText }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { BillingInfoPayload, StripeSubscriptionStatus } from '@/store/modules/billing/types'

import { resolveTrialDaysLeft } from './utils'

@Component({ name: 'trialing' })
export default class Trialing extends Vue {
  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  get trialing (): boolean {
    const { billingInfo: { customer } } = this
    return customer.stripe_subscription_status === StripeSubscriptionStatus.Trialing
  }

  get daysLeftText () {
    const days = resolveTrialDaysLeft(this.billingInfo)
    if (days === 1) { return '1 day left' }
    return `${days} days left`
  }
}
</script>

<style lang="scss" scoped>
.trialing {
  background: $colorWhite;
  color: $colorBlack;
  height: 100%;
  width: 100%;
  @include col;
  justify-content: center;
  align-items: center;
}

.trialing__title {
  @include typography(xxl-1, headlines, bold);
}

.trialing__subtitle {
  @include typography(lg, headlines, bold);
}
</style>
