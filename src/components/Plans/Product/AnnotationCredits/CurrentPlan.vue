<template>
  <product-layout-section
    :text="text"
    :subtext="subtext"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import ProductLayoutSection from '@/components/Plans/Product/Common/ProductLayoutSection.vue'
import { resolveTrialDaysLeft } from '@/components/Plans/Product/utils'
import {
  BillingInfoPayload,
  CustomerSubscriptionPayload,
  StripeSubscriptionStatus,
  RenewalInterval
} from '@/store/modules/billing/types'
import { annotationCreditsBilledNextPeriod } from '@/utils/billing'

@Component({ name: 'current-plan', components: { ProductLayoutSection } })
export default class CurrentPlan extends Vue {
  @Prop({ required: true, type: Object as () => BillingInfoPayload })
  billingInfo!: BillingInfoPayload

  get subscription (): CustomerSubscriptionPayload {
    const { billingInfo: { customer_subscription: subscription } } = this
    if (!subscription) { throw new Error('Invalid customer subscription data') }
    return subscription
  }

  get billedNextPeriod (): number {
    return annotationCreditsBilledNextPeriod(this.billingInfo)
  }

  get trialing (): boolean {
    const { billingInfo: { customer } } = this
    return customer.stripe_subscription_status === StripeSubscriptionStatus.Trialing
  }

  get daysLeftText (): string {
    const days = resolveTrialDaysLeft(this.billingInfo)
    if (days === 1) { return '1 day left' }
    return `${days} days left`
  }

  get renewalInterval (): RenewalInterval {
    const { subscription } = this
    return subscription.renewal_interval || RenewalInterval.Monthly
  }

  get text (): string {
    const { billedNextPeriod, trialing } = this
    if (trialing) { return 'Free Trial' }
    return billedNextPeriod.toString()
  }

  get subtext (): string {
    const { daysLeftText, renewalInterval, trialing } = this
    if (trialing) { return daysLeftText }
    return `Credits ${renewalInterval}`
  }
}
</script>

<style lang="scss" scoped>
.current-plan {
  background: $colorWhite;
  color: $colorBlack;
  height: 100%;
  width: 100%;
  @include col;
  justify-content: center;
  align-items: center;
}

.current-plan__text {
  @include typography(xxl-1, headlines, bold);
}

.current-plan__subtext {
  @include typography(lg, headlines, bold);
}
</style>
