<template>
  <summary-item-layout v-if="creditUsage">
    <template #title>
      {{ team.name }}
    </template>
    <template
      v-if="showLimiter"
      #title-aside
    >
      <usage-limiter
        v-if="partnerBillingInfo"
        :limit="limit"
        :parent-limit="parentLimit"
        :disabled="busy"
        @set-limit="updateUsageLimit(team, $event)"
        @reset-limit="resetUsageLimit(team)"
      />
    </template>
    <template #bar>
      <v2-credit-bar :credit-usage="creditUsage" />
    </template>
    <template #footer-left>
      <credit-bonus-hours :info="billingInfo" />
    </template>
    <template #footer-right>
      <credit-remaining-hours
        v-if="isBillingUsage"
        :value="creditUsage.remaining_credits"
      />
    </template>
  </summary-item-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

import { useStore } from '@/composables'
import { resetClientUsageLimit } from '@/store/modules/billing/actions/resetClientUsageLimit'
import { setClientUsageLimit } from '@/store/modules/billing/actions/setClientUsageLimit'
import { BillingInfoPayload, ProductType } from '@/store/modules/billing/types'
import { CreditUsagePayloadV2, FeatureName, StoreActionPayload, TeamPayload } from '@/store/types'

import CreditBonusHours from './CreditBonusHours.vue'
import CreditRemainingHours from './CreditRemainingHours.vue'
import SummaryItemLayout from './SummaryItemLayout.vue'
import UsageLimiter from './UsageLimiter.vue'
import V2CreditBar from './V2CreditBar.vue'
import { shouldRenderLimiter } from './utils'

/**
 * Renders UI depicting the current state of used credits for a team.
 *
 * This is used to render usage levels
 *
 * - of a regular team
 * - of a partner team
 * - of a client team
 * - of a client team, as part of the overall summary for a partner team, on a
 *   partner team's usage tab. In this case, the component will also render
 *   UI to set usage limits for the client team. The prop `partnerBillingInfo`
 *   needs to be provided, in this case.
 */
export default defineComponent({
  name: 'CreditSummaryItem',
  components: {
    V2CreditBar,
    CreditBonusHours,
    CreditRemainingHours,
    SummaryItemLayout,
    UsageLimiter
  },
  props: {
    team: { required: true, type: Object as () => TeamPayload },
    billingInfo: { required: true, type: Object as () => BillingInfoPayload },
    partnerBillingInfo: {
      required: false,
      type: Object as () => BillingInfoPayload | null,
      default: null
    },
    creditUsage: { required: true, type: Object as () => CreditUsagePayloadV2 }
  },
  setup (props) {
    const busy = ref(false)
    const { dispatch, getters } = useStore()

    const limit = computed((): number => (
      props.billingInfo.customer_subscription.annotation_credits_standard_max_in_period
    ))

    const parentLimit = computed((): number => {
      const info = props.partnerBillingInfo || props.billingInfo
      return info.customer_subscription.annotation_credits_standard_max_in_period
    })

    const showLimiter = computed((): boolean => {
      return shouldRenderLimiter(props.team, props.partnerBillingInfo)
    })

    const isBillingUsage = computed((): boolean => {
      const feature: FeatureName = 'TICKER_BILLING'
      return getters['features/isFeatureEnabled'](feature)
    })

    const updateUsageLimit = async (client: TeamPayload, limit: number): Promise<void> => {
      busy.value = true

      const payload: StoreActionPayload<typeof setClientUsageLimit> = {
        client,
        type: ProductType.AnnotationCredits,
        value: limit
      }

      const result = await dispatch('billing/setClientUsageLimit', payload)

      if ('error' in result) {
        dispatch('toast/warning', { content: result.error.message })
      } else {
        dispatch('toast/notify', { content: 'Settings updated' })
      }

      busy.value = false
    }

    const resetUsageLimit = async (client: TeamPayload): Promise<void> => {
      busy.value = true

      const payload: StoreActionPayload<typeof resetClientUsageLimit> = {
        client,
        type: ProductType.AnnotationCredits
      }

      const result = await dispatch('billing/resetClientUsageLimit', payload)

      if ('error' in result) {
        dispatch('toast/warning', { content: result.error.message })
      } else {
        dispatch('toast/notify', { content: 'Settings updated' })
      }

      busy.value = false
    }

    return {
      busy,
      limit,
      parentLimit,
      showLimiter,
      isBillingUsage,
      updateUsageLimit,
      resetUsageLimit
    }
  }
})
</script>
