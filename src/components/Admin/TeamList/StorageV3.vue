<template>
  <div class="storage">
    <v-popover trigger="hover">
      <div
        class="storage__info"
        :class="{'storage__info--critical': lowStorage}"
      >
        {{ currentPeriodRemainingGBFormatted }}
      </div>
      <template slot="popover">
        <div class="storage__tooltip-row">
          <label>Billed this period</label>
          <span>{{ currentPeriodBilledGBFormatted }}</span>
        </div>
        <div class="storage__tooltip-row">
          <label>Used this period</label>
          <span>{{ currentPeriodUsedGBFormatted }}</span>
        </div>
        <div class="storage__tooltip-row">
          <label>Billed next period</label>
          <span>{{ nextPeriodBilledGBFormatted }}</span>
        </div>
      </template>
    </v-popover>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { CirclePlusIcon } from '@/assets/icons/V1'
import { TeamPayload } from '@/store/modules/admin/types'
import { CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import {
  adaptAdminTeamPayload,
  storageBilledNextPeriod,
  storageBilledThisPeriod,
  storageRemainingThisPeriod
} from '@/utils/billing'

@Component({ name: 'storage', components: { CirclePlusIcon } })
export default class Storage extends Vue {
  @Prop({ required: true })
  team!: TeamPayload

  get subscription (): CustomerSubscriptionPayload {
    if (!this.team.customer_v3) { throw new Error('BillingV3 team missing customer information') }
    return this.team.customer_v3.customer_subscription
  }

  get adaptedInfo (): ReturnType<typeof adaptAdminTeamPayload> {
    return adaptAdminTeamPayload(this.team)
  }

  get currentPeriodBilledGB (): number {
    return storageBilledThisPeriod(this.adaptedInfo)
  }

  get currentPeriodBilledGBFormatted () {
    return this.currentPeriodBilledGB.toLocaleString()
  }

  get currentPeriodUsedGB (): number {
    return this.subscription.storage_used
  }

  get currentPeriodUsedGBFormatted () {
    return this.currentPeriodUsedGB.toLocaleString()
  }

  get currentPeriodRemainingGB (): number {
    return storageRemainingThisPeriod(this.adaptedInfo)
  }

  get currentPeriodRemainingGBFormatted () {
    return this.currentPeriodRemainingGB.toLocaleString()
  }

  get lowStorage (): boolean {
    return this.currentPeriodRemainingGB < 5
  }

  get nextPeriodBilledGB (): number {
    return storageBilledNextPeriod(this.adaptedInfo)
  }

  get nextPeriodBilledGBFormatted () {
    return this.nextPeriodBilledGB.toLocaleString()
  }
}
</script>

<style lang="scss" scoped>
.storage {
  @include row--right;
  width: 100%;
}

.storage__info {
  margin-right: 10px;
}

.storage-storage__info--critical {
  font-weight: bold;
  color: $colorPink;
}

.storage__tooltip-row {
  min-width: 150px;
  margin: 10px;
  @include row--distributed;
}

.storage__tooltip-row label {
  font-weight: bold;
}
</style>
