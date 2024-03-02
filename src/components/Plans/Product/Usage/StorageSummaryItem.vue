<template>
  <summary-item-layout>
    <template
      v-if="showTitle"
      #title
    >
      {{ team.name }}
    </template>
    <template
      v-if="team.managed_status === 'client'"
      #title-aside
    >
      <usage-limiter
        v-if="showLimiter"
        :limit="limit"
        :parent-limit="parentLimit"
        :disabled="busy"
        @set-limit="updateUsageLimit(team, $event)"
        @reset-limit="resetUsageLimit(team)"
      />
    </template>
    <template #bar>
      <storage-bar :billing-info="billingInfo" />
    </template>
    <template #footer-left>
      <storage-extra-amount :info="billingInfo" />
    </template>
    <template #footer-right>
      <storage-remaining-amount :info="billingInfo" />
    </template>
  </summary-item-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { resetClientUsageLimit } from '@/store/modules/billing/actions/resetClientUsageLimit'
import { setClientUsageLimit } from '@/store/modules/billing/actions/setClientUsageLimit'
import { BillingInfoPayload, ProductType } from '@/store/modules/billing/types'
import { StoreActionPayload, TeamPayload } from '@/store/types'

import StorageBar from './StorageBar.vue'
import StorageExtraAmount from './StorageExtraAmount.vue'
import StorageRemainingAmount from './StorageRemainingAmount.vue'
import SummaryItemLayout from './SummaryItemLayout.vue'
import UsageLimiter from './UsageLimiter.vue'
import { shouldRenderLimiter, shouldRenderTitle } from './utils'

/**
 * Renders UI depicting the current state of used storage for a team.
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
@Component({
  name: 'storage-summary-item',
  components: {
    StorageBar,
    StorageExtraAmount,
    StorageRemainingAmount,
    SummaryItemLayout,
    UsageLimiter
  }
})
export default class StorageSummaryItem extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  @Prop({ required: true, type: Object as () => BillingInfoPayload })
  billingInfo!: BillingInfoPayload

  get limit (): number {
    return this.billingInfo.customer_subscription.storage_standard_max_in_period
  }

  @Prop({ required: false, type: Object as () => BillingInfoPayload })
  partnerBillingInfo!: BillingInfoPayload | null

  get parentLimit (): number {
    const info = this.partnerBillingInfo || this.billingInfo
    return info.customer_subscription.storage_standard_max_in_period
  }

  get showTitle (): boolean {
    const { team, partnerBillingInfo } = this
    return shouldRenderTitle(team, partnerBillingInfo)
  }

  get showLimiter (): boolean {
    const { team, partnerBillingInfo } = this
    return shouldRenderLimiter(team, partnerBillingInfo)
  }

  busy: boolean = false

  async updateUsageLimit (client: TeamPayload, limit: number): Promise<void> {
    this.busy = true

    const payload: StoreActionPayload<typeof setClientUsageLimit> = {
      client,
      type: ProductType.Storage,
      value: limit
    }

    const result = await this.$store.dispatch('billing/setClientUsageLimit', payload)
    if ('error' in result) {
      this.$store.dispatch('toast/warning', { content: result.error.message })
    } else {
      this.$store.dispatch('toast/notify', { content: 'Settings updated' })
    }

    this.busy = false
  }

  async resetUsageLimit (client: TeamPayload): Promise<void> {
    this.busy = true

    const payload: StoreActionPayload<typeof resetClientUsageLimit> = {
      client,
      type: ProductType.Storage
    }

    const result = await this.$store.dispatch('billing/resetClientUsageLimit', payload)
    if ('error' in result) {
      this.$store.dispatch('toast/warning', { content: result.error.message })
    } else {
      this.$store.dispatch('toast/notify', { content: 'Settings updated' })
    }

    this.busy = false
  }
}
</script>
