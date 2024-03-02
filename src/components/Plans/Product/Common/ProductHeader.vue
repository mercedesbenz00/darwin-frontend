<template>
  <div class="product-header">
    <div class="product-header__title">
      Base Plan -
      <strong class="product-header__title__name">{{ planName }}</strong>
    </div>
    <div
      v-if="formattedRenewDate"
      class="product-header__date"
    >
      Renews {{ formattedRenewDate }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { PlanPricing, resolvePlanForCredit } from '@/components/Plans/Product/utils'
import { BillingInfoPayload, StripeSubscriptionStatus } from '@/store/modules/billing/types'
import { formatUnixDate } from '@/utils'
import { annotationCreditsBilledNextPeriod } from '@/utils/billing'

@Component({ name: 'product-header' })
export default class ProductHeader extends Vue {
  @Prop({ required: true, type: Object as () => BillingInfoPayload })
  billingInfo!: BillingInfoPayload

  get billedNextPeriod (): number {
    return annotationCreditsBilledNextPeriod(this.billingInfo)
  }

  get displayLegacyEssentials (): boolean {
    const { billingInfo, billedNextPeriod } = this

    if (!billingInfo.freemium && billedNextPeriod === PlanPricing.freemium) {
      return true
    }
    return false
  }

  get name (): string {
    const { billingInfo, billedNextPeriod } = this
    if (billingInfo.customer.stripe_subscription_status === StripeSubscriptionStatus.Trialing) {
      return 'Trial'
    }

    if (billingInfo.freemium) {
      return 'Education'
    }

    if (billedNextPeriod === 0) {
      return 'Cancelled'
    }

    return resolvePlanForCredit(this.billedNextPeriod)
  }

  get planName (): string {
    const { name, displayLegacyEssentials } = this
    if (name === 'freemium') {
      if (displayLegacyEssentials) {
        return 'essentials'
      }
    }
    return name
  }

  get renewDate (): number | null {
    return this.billingInfo.customer.stripe_subscription_period_end
  }

  get formattedRenewDate (): string | null {
    const { renewDate } = this
    if (!renewDate) { return null }
    return formatUnixDate(renewDate, 'DD/MM/YY')
  }
}
</script>

<style lang="scss" scoped>
.product-header {
  border-bottom: 1px solid $colorAliceShadow;
  margin-bottom: 10px;
  @include typography(xl, headlines, bold);

  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
}

.product-header__title__name {
  text-transform: capitalize;
}

.product-header__date {
  @include typography(lg-1, headlines, normal);
  color: $colorAliceNight;
}
</style>
