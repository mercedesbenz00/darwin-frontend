<template>
  <div
    v-if="$can('view_customer') && shouldRender"
    class="billing-box"
  >
    <template v-if="lockedOut">
      <h3 class="billing-box__title">
        You reached your plan's usage limit - Upgrade Now
      </h3>
      <ul
        v-if="lockedOutReasons.length > 0"
        class="billing-box__description"
      >
        <li
          v-for="reason in lockedOutReasons"
          :key="reason"
          v-html="reason"
        />
      </ul>
    </template>
    <template v-else-if="trialing && noCredits">
      <h3 class="billing-box__title">
        Your free trial has ended - Upgrade now
      </h3>
      <p
        class="billing-box__description"
      >
        You can start small and increase your monthly capacity as you datasets grow.
      </p>
    </template>
    <template v-else-if="trialing">
      <h3 class="billing-box__title">
        🎉 Welcome to {{ team.name }}'s Free Trial
      </h3>
      <p class="billing-box__description">
        Invite as many users as you wish, upload data, label it, run models,
        or any other functionality present.
        You can upgrade any time, and carry over your trial credits.
      </p>
    </template>
    <div class="billing-box__info">
      <div
        v-if="trialing"
        class="billing-box__info__item info-item"
      >
        <div class="info-item__label">
          Days Left
        </div>
        <div class="info-item__value">
          {{ daysLeft }}
        </div>
      </div>
      <div class="billing-box__info__item info-item">
        <div class="info-item__label">
          Annotation Credits
        </div>
        <div class="info-item__value">
          {{ annotationCredits }}
        </div>
      </div>
      <div class="billing-box__info__item info-item">
        <div class="info-item__label">
          Storage
        </div>
        <div class="info-item__value">
          {{ storage }}
        </div>
      </div>
    </div>
    <div class="billing-box__action">
      <positive-button
        v-if="trialing || noCredits"
        tag="router-link"
        :to="'?settings=plans'"
      >
        Upgrade
      </positive-button>
      <primary-button
        v-else
        tag="router-link"
        :to="'?settings=plans'"
      >
        View Plans
      </primary-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { resolveTrialDaysLeft } from '@/components/Plans/Product/utils'
import {
  BillingInfoPayload,
  StripeSubscriptionStatus,
  LockedOutReason
} from '@/store/modules/billing/types'
import { TeamPayload } from '@/store/types'
import { formatInteger } from '@/utils'
import { annotationCreditsRemainingThisPeriod } from '@/utils/billing'

const REASON_TEXT: { [k in LockedOutReason]: string } = {
  [LockedOutReason.Admin]:
    [
      'There was a problem with your billing information.',
      'Try entering your billing and card details again,',
      'or contact <a href="mailto:support@v7labs.com">support@v7labs.com</a>.'
    ].join(' '),
  [LockedOutReason.AnnotationCredit]:
    'You have used up all your annotation credits. Add more to your plan.',
  [LockedOutReason.InstanceCredit]:
    'You have used up all your neurons credits. Add more to your plan.',
  [LockedOutReason.Storage]:
    [
      'You have exceeded the number of managed files supported by your plan.',
      'Upgrade to increase the amount.'
    ].join(' ')
}

@Component({
  name: 'billing-box'
})
export default class BillingBox extends Vue {
  mounted (): void {
    if (this.$can('view_customer')) {
      this.loadBillingInfo()
    } else {
      this.loading = false
    }
  }

  loading: boolean = true

  async loadBillingInfo (): Promise<void> {
    this.loading = true
    await this.$store.dispatch('billing/loadBillingInfo')
    this.loading = false
  }

  get shouldRender (): boolean {
    const { billingInfo, lockedOut, trialing } = this
    return (trialing || lockedOut) && !!billingInfo
  }

  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload | null

  get trialing (): boolean {
    const { billingInfo } = this
    if (!billingInfo) { return false }
    return billingInfo.customer.stripe_subscription_status === StripeSubscriptionStatus.Trialing
  }

  get noCredits (): boolean {
    const { billingInfo } = this
    if (!billingInfo) { return false }
    return annotationCreditsRemainingThisPeriod(billingInfo) <= 0
  }

  get lockedOut (): boolean {
    const { billingInfo } = this
    if (!billingInfo || !billingInfo.customer_subscription) { return false }
    return billingInfo.customer_subscription.locked_out
  }

  get lockedOutReasons (): string[] {
    const { billingInfo } = this
    if (!billingInfo || !billingInfo.customer_subscription) { return [] }
    return billingInfo.customer_subscription.locked_out_reasons.map(r => REASON_TEXT[r])
  }

  @State(state => state.team.currentTeam)
  team!: TeamPayload

  // items

  get daysLeft (): number {
    const { billingInfo } = this
    if (!billingInfo) { return 0 }
    return resolveTrialDaysLeft(billingInfo)
  }

  get annotationCredits (): number {
    const { billingInfo, trialing } = this
    if (!billingInfo || !billingInfo.customer_subscription) { return 0 }
    const { customer_subscription: subscription } = billingInfo
    const {
      annotation_credits_bonus: bonus,
      annotation_credits_standard: standard,
      annotation_credits_used: used
    } = subscription

    const available = trialing ? bonus : bonus + standard
    return Math.max(available - used, 0)
  }

  get storageAmount (): number {
    const { billingInfo } = this
    if (!billingInfo || !billingInfo.customer_subscription) { return 0 }
    const {
      storage_standard: standard,
      storage_standard_max_in_period: max,
      storage_used: used
    } = billingInfo.customer_subscription
    const actual = Math.max(standard, max)
    return Math.max(actual - used, 0)
  }

  get storage (): string {
    return `${formatInteger(this.storageAmount)} managed files remaining`
  }
}
</script>

<style lang="scss" scoped>
.billing-box {
  background: $colorAliceBlue;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 5px 20px rgba(145, 169, 192, 0.3);
  z-index: var(--z-index-dataset-overlay);
}

.billing-box__title {
  @include typography(md-1, mulish, bold);
  color: $color90Black;
  margin-bottom: 8px;
}

.billing-box__description {
  @include typography(md, mulish);
  color: $color90Black;
  margin-bottom: 8px;
}

.billing-box__info {
  @include row;
  align-items: center;
  margin-bottom: 13px;
}

.billing-box__info__item {
  margin-right: 24px;
}

.info-item {
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: .5em;
  @include typography(md, mulish);
}

.info-item__value {
  font-weight: bold;
}

.billing-box__action {
  @include row;
  align-items: center;
  justify-content: flex-end;
}
</style>
