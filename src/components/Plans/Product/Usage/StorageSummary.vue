<template>
  <div class="storage-summary">
    <header-3 class="storage-summary__title">
      Dataset Management
    </header-3>
    <storage-summary-item
      :team="currentTeam"
      :billing-info="billingInfo"
    />
    <storage-summary-item
      v-for="{client, clientInfo} in clientBillingInfos"
      :key="client.id"
      :billing-info="clientInfo"
      :partner-billing-info="billingInfo"
      :team="client"
    />
    <storage-explanation />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Header3 from '@/components/Common/Header3.vue'
import { BillingInfoPayload } from '@/store/modules/billing/types'
import { RootState, TeamPayload } from '@/store/types'

import StorageExplanation from './StorageExplanation.vue'
import StorageSummaryItem from './StorageSummaryItem.vue'

/**
 * Renders storage summary for a team.
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
@Component({
  name: 'storage-summary',
  components: {
    Header3,
    StorageExplanation,
    StorageSummaryItem
  }
})
export default class StorageSummary extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  get clientBillingInfos (): {
    client: TeamPayload,
    clientInfo: BillingInfoPayload
  } [] {
    const { currentTeam, billingInfo } = this
    if (!billingInfo) { throw new Error('Billing incorrectly loaded') }

    return billingInfo.clients.map(clientInfo => {
      const client = currentTeam.clients.find(t => t.id === clientInfo.customer.team_id)
      if (!client) { throw new Error('Invalid data') }
      return { client, clientInfo }
    })
  }
}
</script>

<style lang="scss" scoped>
.storage-summary {
  @include col;
  row-gap: 25px;
}
</style>
