<template>
  <div class="annotation-credits">
    <product-header :billing-info="billingInfo" />
    <div class="annotation-credits__body">
      <div class="annotation-credits__body__current">
        <current-plan :billing-info="billingInfo" />
        <primary-button
          class="annotation-credits__body__current__change"
          @click="showModal"
        >
          Change
        </primary-button>
        <div class="annotation-credits__body__current__bonus">
          Bonus credits: {{ bonus }}
        </div>
      </div>
      <div class="annotation-credits__body__features">
        <feature-list :features="features" />
      </div>
    </div>
    <edit-plan-modal />
    <typeform-modal @submit="confirmCancelPlan" />
    <cancel-plan-confirm-modal />
    <switch-open-datasets-dialog />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ProductHeader from '@/components/Plans/Product/Common/ProductHeader.vue'
import SwitchOpenDatasetsDialog from '@/components/Plans/Product/SwitchOpenDatasetsDialog.vue'
import {
  PlanFeature,
  PlanPricing,
  resolveFeaturesForPlan,
  resolvePlanForCredit,
  SubscriptionPlanName
} from '@/components/Plans/Product/utils'
import {
  BillingInfoPayload,
  CustomerSubscriptionPayload,
  ProductType,
  StripeSubscriptionStatus,
  RenewalInterval
} from '@/store/modules/billing/types'
import { formatDecimal } from '@/utils'
import { annotationCreditsBilledNextPeriod } from '@/utils/billing'

import CancelPlanConfirmModal from './CancelPlanConfirmModal.vue'
import CurrentPlan from './CurrentPlan.vue'
import EditPlanModal from './EditPlanModal.vue'
import FeatureList from './FeatureListV2.vue'
import TypeformModal from './TypeformModal.vue'

@Component({
  name: 'annotation-credits',
  components: {
    CancelPlanConfirmModal,
    CurrentPlan,
    EditPlanModal,
    FeatureList,
    ProductHeader,
    TypeformModal,
    SwitchOpenDatasetsDialog
  }
})
export default class AnnotationCredits extends Vue {
  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  showModal (): void { this.$modal.show(ProductType.AnnotationCredits) }
  hideModal (): void { this.$modal.hide(ProductType.AnnotationCredits) }

  confirmCancelPlan (): void {
    this.$modal.show('cancel-plan-confirm-modal')
  }

  get subscription (): CustomerSubscriptionPayload {
    const { billingInfo: { customer_subscription: subscription } } = this
    if (!subscription) { throw new Error('Invalid customer subscription data') }
    return subscription
  }

  get isTrialing (): boolean {
    const { billingInfo } = this
    return billingInfo.customer.stripe_subscription_status === StripeSubscriptionStatus.Trialing
  }

  get currentPlan (): SubscriptionPlanName {
    const { billingInfo } = this

    if (billingInfo.freemium) {
      return 'freemium'
    }
    const currentAmount = annotationCreditsBilledNextPeriod(billingInfo)
    return resolvePlanForCredit(currentAmount)
  }

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

  get renewalInterval (): RenewalInterval {
    const { subscription } = this
    return subscription.renewal_interval || RenewalInterval.Monthly
  }

  get renewalIntervalForDisplay (): string {
    const { renewalInterval } = this
    return renewalInterval.slice(0, -2)
  }

  get features (): PlanFeature[] {
    const { displayLegacyEssentials, renewalIntervalForDisplay } = this
    const currentAmount = annotationCreditsBilledNextPeriod(this.billingInfo)
    const planFeatures = resolveFeaturesForPlan(displayLegacyEssentials
      ? 'essentials'
      : this.currentPlan)

    if (this.isTrialing || currentAmount === 0) {
      return planFeatures
    }

    const { subscription } = this
    const actions = Math.floor(currentAmount * 3600 / subscription.seconds_per_automation_action)

    return [
      {
        label: `Up to ${currentAmount} hours of annotation per ${renewalIntervalForDisplay}`,
        or: true,
        enabled: true
      },
      {
        label:
          `Up to ${formatDecimal(actions)} automation actions per ${renewalIntervalForDisplay}`,
        enabled: true
      },
      ...planFeatures
    ]
  }

  get bonus (): number {
    return this.subscription.annotation_credits_bonus
  }
}
</script>
<style lang="scss" scoped>
.annotation-credits {
  @include col;
  gap: 10px;
}
.annotation-credits__body {
  display: grid;
  grid-template-columns: 180px 1fr;
  column-gap: 40px;
}

.annotation-credits__body__features {
  border-radius: 10px;
  background: $colorAliceBlue;

  > * {
    max-height: 360px;
    overflow: auto;
    @include scrollbar;
    margin: 20px 24px;
  }
}

.annotation-credits__body__current {
  display: grid;
  grid-auto-flow: row;
  justify-items: center;
  align-content: center;
  row-gap: 20px;
}

.annotation-credits__body__current__change {
  justify-self: stretch;
}

.annotation-credits__body__current__bonus {
  color: $colorAliceNight;
}
</style>
