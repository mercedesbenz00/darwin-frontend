<template>
  <summary-item-layout v-if="creditUsage">
    <template
      v-if="showTitle"
      #title
    >
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
      <credit-bar :credit-usage="creditUsage" />
    </template>
    <template #footer-left>
      <credit-bonus-hours :info="billingInfo" />
    </template>
    <template #footer-right>
      <credit-remaining-hours :value="creditUsage.remaining_hours" />
    </template>
  </summary-item-layout>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import { useStore } from '@/composables'
import { resetClientUsageLimit } from '@/store/modules/billing/actions/resetClientUsageLimit'
import { setClientUsageLimit } from '@/store/modules/billing/actions/setClientUsageLimit'
import { BillingInfoPayload, ProductType } from '@/store/modules/billing/types'
import { CreditUsagePayload, StoreActionPayload, TeamPayload } from '@/store/types'

import CreditBar from './CreditBar.vue'
import CreditBonusHours from './CreditBonusHours.vue'
import CreditRemainingHours from './CreditRemainingHours.vue'
import SummaryItemLayout from './SummaryItemLayout.vue'
import UsageLimiter from './UsageLimiter.vue'
import { shouldRenderLimiter, shouldRenderTitle } from './utils'

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
    CreditBar,
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
    creditUsage: { required: true, type: Object as () => CreditUsagePayload }
  },
  setup (props) {
    const busy = ref(false)
    const store = useStore()

    const limit = computed((): number => (
      props.billingInfo.customer_subscription.annotation_credits_standard_max_in_period
    ))

    const parentLimit = computed((): number => {
      const info = props.partnerBillingInfo || props.billingInfo
      return info.customer_subscription.annotation_credits_standard_max_in_period
    })

    const showTitle = computed((): boolean => {
      return shouldRenderTitle(props.team, props.partnerBillingInfo)
    })

    const showLimiter = computed((): boolean => {
      return shouldRenderLimiter(props.team, props.partnerBillingInfo)
    })

    const updateUsageLimit = async (client: TeamPayload, limit: number): Promise<void> => {
      busy.value = true

      const payload: StoreActionPayload<typeof setClientUsageLimit> = {
        client,
        type: ProductType.AnnotationCredits,
        value: limit
      }

      const result = await store.dispatch('billing/setClientUsageLimit', payload)

      if ('error' in result) {
        store.dispatch('toast/warning', { content: result.error.message })
      } else {
        store.dispatch('toast/notify', { content: 'Settings updated' })
      }

      busy.value = false
    }

    const resetUsageLimit = async (client: TeamPayload): Promise<void> => {
      busy.value = true

      const payload: StoreActionPayload<typeof resetClientUsageLimit> = {
        client,
        type: ProductType.AnnotationCredits
      }

      const result = await store.dispatch('billing/resetClientUsageLimit', payload)

      if ('error' in result) {
        store.dispatch('toast/warning', { content: result.error.message })
      } else {
        store.dispatch('toast/notify', { content: 'Settings updated' })
      }

      busy.value = false
    }

    return {
      busy,
      limit,
      parentLimit,
      showTitle,
      showLimiter,
      updateUsageLimit,
      resetUsageLimit
    }
  }
})
</script>
