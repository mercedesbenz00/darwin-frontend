<template>
  <PanelFloatingWhite
    v-if="isAuthorized('view_customer') && shouldRender"
    class="billing-box"
  >
    <div
      v-if="trialing"
      class="billing-box__left"
    >
      <h3 class="billing-box__icon">
        🎉
      </h3>
    </div>
    <div class="billing-box__right">
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
      <template v-else-if="trialing && team">
        <h3 class="billing-box__title">
          Welcome to {{ team.name }}'s Free Trial
        </h3>
        <p class="billing-box__description">
          Invite as many users as you wish, upload data, label it,
          run models, or any other functionality present.
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
          <div class="info-item__label">
            managed files remaining
          </div>
        </div>
      </div>
      <div class="billing-box__action">
        <custom-button
          v-if="trialing || noCredits"
          color="primary"
          size="medium"
          flair="rounded"
          tag="router-link"
          :to="'?settings=plans'"
        >
          Upgrade
        </custom-button>
        <custom-button
          v-else
          color="primary"
          size="medium"
          flair="rounded"
          tag="router-link"
          :to="'?settings=plans'"
        >
          View Plans
        </custom-button>
      </div>
    </div>
  </PanelFloatingWhite>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  Ref,
  onMounted
} from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import { resolveTrialDaysLeft } from '@/components/Plans/Product/utils'
import { useAuth, useStore } from '@/composables'
import {
  BillingInfoPayload,
  StripeSubscriptionStatus,
  LockedOutReason
} from '@/store/modules/billing/types'
import { TeamPayload } from '@/store/types'
import PanelFloatingWhite from '@/uiKit/Panel/PanelFloatingWhite.vue'
import { formatInteger } from '@/utils'
import { annotationCreditsRemainingThisPeriod } from '@/utils/billing'

const REASON_TEXT: { [k in LockedOutReason]: string } = {
  [LockedOutReason.Admin]:
    [
      'There was a problem with your billing information.',
      'Try entering your billing and card details again, or contact',
      '<a href="mailto:support@v7labs.com">support@v7labs.com</a>.',

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

export default defineComponent({
  name: 'V2BillingBox',
  components: {
    CustomButton,
    PanelFloatingWhite
  },
  setup () {
    const loading: Ref<boolean> = ref(true)
    const { isAuthorized } = useAuth()
    const { dispatch, state } = useStore()

    const loadBillingInfo = async () => {
      loading.value = true
      await dispatch('billing/loadBillingInfo')
      loading.value = false
    }

    onMounted(() => {
      if (isAuthorized('view_customer')) {
        loadBillingInfo()
      } else {
        loading.value = false
      }
    })

    const billingInfo: Ref<BillingInfoPayload | null> = computed(() => {
      return state.billing.billingInfo
    })

    const trialing: Ref<boolean> = computed(() => {
      if (billingInfo.value == null) { return false }
      return (
        billingInfo.value.customer.stripe_subscription_status === StripeSubscriptionStatus.Trialing
      )
    })

    const noCredits: Ref<boolean> = computed(() => {
      if (!billingInfo.value) { return false }
      return annotationCreditsRemainingThisPeriod(billingInfo.value) <= 0
    })

    const lockedOut: Ref<boolean> = computed(() => {
      if (!billingInfo.value || !billingInfo.value.customer_subscription) { return false }
      return billingInfo.value.customer_subscription.locked_out
    })

    const shouldRender: Ref<boolean> = computed(() => {
      return (trialing.value || lockedOut.value) && !!billingInfo.value
    })

    const lockedOutReasons: Ref<string[]> = computed(() => {
      if (!billingInfo.value || !billingInfo.value.customer_subscription) { return [] }
      return billingInfo.value.customer_subscription.locked_out_reasons.map(r => REASON_TEXT[r])
    })

    const team: Ref<TeamPayload|null> = computed(() => {
      return state.team.currentTeam
    })

    const daysLeft: Ref<number> = computed(() => {
      if (!billingInfo.value) { return 0 }
      return resolveTrialDaysLeft(billingInfo.value)
    })

    const annotationCredits: Ref<number> = computed(() => {
      if (!billingInfo.value || !billingInfo.value.customer_subscription) { return 0 }
      const { customer_subscription: subscription } = billingInfo.value
      const {
        annotation_credits_bonus: bonus,
        annotation_credits_standard: standard,
        annotation_credits_used: used
      } = subscription

      const available = trialing.value ? bonus : bonus + standard
      return Math.max(available - used, 0)
    })

    const storageAmount: Ref<number> = computed(() => {
      if (!billingInfo.value || !billingInfo.value.customer_subscription) { return 0 }
      const {
        storage_standard: standard,
        storage_standard_max_in_period: max,
        storage_used: used
      } = billingInfo.value.customer_subscription
      const actual = Math.max(standard, max)
      return Math.max(actual - used, 0)
    })

    const storage: Ref<string> = computed(() => {
      return `${formatInteger(storageAmount.value)}`
    })

    return {
      annotationCredits,
      daysLeft,
      isAuthorized,
      lockedOut,
      lockedOutReasons,
      noCredits,
      shouldRender,
      team,
      trialing,
      storage
    }
  }
})
</script>

<style lang="scss" scoped>
.billing-box {
  @include row;
  padding: 24px;
  margin-top: 8px;
  gap: 16px;
}

.billing-box__title {
  @include typography(lg, inter, bold);
  color: $colorContentDefault;
  margin-bottom: 8px;
}

.billing-box__description {
  @include typography(md-1, inter);
  color: $colorContentSecondary;
  margin-bottom: 8px;
}

.billing-box__info {
  @include row;
  align-items: center;
  margin-bottom: 8px;
  color: $colorContentSecondary;
}

.billing-box__info__item {
  margin-right: 4px;
}

.info-item {
  @include row;
  gap: 4px;
  @include typography(md-1, inter);
}

.info-item__value {
  font-weight: bold;
}

.billing-box__action {
  @include row;
  align-items: center;
  justify-content: flex-start;
}

.billing-box__icon {
  font-size: 32px;
}
</style>
