<template>
  <div class="credit">
    <div class="credit__loading">
      <div
        v-loading="loading"
        :loading-options="{
          minTimeout: 500,
          backgroundColor: 'transparent',
          size: 'small',
          label: undefined
        }"
      />
    </div>
    <header-3 class="credit__title">
      Credits usage this billing period
    </header-3>
    <template v-if="creditUsage || creditUsageV2">
      <template v-if="isTicker">
        <v2-credit-summary-item
          :team="currentTeam"
          :billing-info="billingInfo"
          :credit-usage="creditUsageV2"
        />
        <v2-credit-summary-item
          v-for="{client, clientInfo, clientUsage} in clientUsagesV2"
          :key="client.id"
          :team="client"
          :billing-info="clientInfo"
          :credit-usage="clientUsage"
        />
      </template>
      <template v-else>
        <credit-summary-item
          :team="currentTeam"
          :billing-info="billingInfo"
          :credit-usage="creditUsage"
        />
        <credit-summary-item
          v-for="{client, clientInfo, clientUsage} in clientUsages"
          :key="client.id"
          :team="client"
          :billing-info="clientInfo"
          :credit-usage="clientUsage"
          :partner-billing-info="billingInfo"
        />
      </template>
    </template>
    <credit-explanation class="credit__usage__description" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'

import Header3 from '@/components/Common/Header3.vue'
import { useStore } from '@/composables'
import { FeatureName } from '@/store/types'

import CreditExplanation from './CreditExplanation.vue'
import CreditSummaryItem from './CreditSummaryItem.vue'
import V2CreditSummaryItem from './V2CreditSummaryItem.vue'

/**
 * Renders credit summary for a team.
 *
 * The following teams will only have their main section rendered
 *
 * - regular team
 * - client team
 * - partner team with 0 clients
 *
 * A partner team with 1 or more clients will render an additional section for
 * every client. These additional sections will contain UI to set usage limits
 * for the client.
 */
export default defineComponent({
  name: 'CreditSummary',
  components: {
    CreditExplanation,
    CreditSummaryItem,
    V2CreditSummaryItem,
    Header3
  },
  setup () {
    const loading = ref(true)
    const { getters, state, dispatch } = useStore()
    const currentTeam = computed(() => state.team.currentTeam)
    const billingInfo = computed(() => state.billing.billingInfo)
    const creditUsageV2 = computed(() => state.billing.creditUsageV2)
    const creditUsage = computed(() => state.billing.creditUsage)

    const isTicker = computed((): boolean => {
      const feature: FeatureName = 'TICKER_UI'
      return getters['features/isFeatureEnabled'](feature)
    })

    const clientUsages = computed(() => {
      if (!creditUsage.value) { return [] }

      return creditUsage.value.clients.map(clientUsage => {
        if (!currentTeam.value) { return [] }
        if (!billingInfo.value) { return [] }

        const client = currentTeam.value.clients.find(t => t.id === clientUsage.team_id)
        const clientInfo = billingInfo.value.clients
          .find(c => c.customer.team_id === clientUsage.team_id)
        if (!client || !clientInfo) { throw new Error('Invalid data') }
        return { client, clientInfo, clientUsage }
      })
    })

    const clientUsagesV2 = computed(() => {
      if (!creditUsageV2.value) { return [] }

      return creditUsageV2.value.clients.map(clientUsage => {
        if (!currentTeam.value) { return [] }
        if (!billingInfo.value) { return [] }

        const client = currentTeam.value.clients.find(t => t.id === clientUsage.team_id)
        const clientInfo = billingInfo.value.clients
          .find(c => c.customer.team_id === clientUsage.team_id)
        if (!client || !clientInfo) { throw new Error('Invalid data') }
        return { client, clientInfo, clientUsage }
      })
    })

    const loadCreditUsage = async (): Promise<void> => {
      loading.value = true
      const { error } = await dispatch('billing/loadCreditUsage')
      loading.value = false

      if (error) {
        dispatch('toast/warning', { content: error.message })
      }
    }

    onMounted(() => {
      loadCreditUsage()
    })

    return {
      loading,
      currentTeam,
      billingInfo,
      creditUsageV2,
      creditUsage,
      clientUsages,
      clientUsagesV2,
      isTicker
    }
  }
})
</script>

<style lang="scss" scoped>
.credit {
  position: relative;
  display: grid;
  justify-content: space-between;
  align-self: center;
  row-gap: 25px;
  width: 100%;
}

.credit__loading {
  position: absolute;
  right: 20px;
}
</style>
