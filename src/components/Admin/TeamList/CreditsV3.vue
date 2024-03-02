<template>
  <div class="credits">
    <v-popover trigger="hover">
      <div
        class="credits__info"
        :class="{'credits__info--critical': closeToExpiry || fewCreditsLeft}"
      >
        {{ remainingThisPeriodFormatted }}
      </div>
      <template slot="popover">
        <div class="credits__tooltip-row">
          <label>Billed this period</label>
          <span>{{ billedThisPeriodFormatted }}</span>
        </div>
        <div class="credits__tooltip-row">
          <label>Remaining this period</label>
          <span>{{ remainingThisPeriodFormatted }}</span>
        </div>
        <div class="credits__tooltip-row">
          <label>Billed next period</label>
          <span>{{ billedNextPeriodFormatted }}</span>
        </div>
        <div
          v-if="daysToNextExpiry"
          class="credits__tooltip-row"
        >
          <label>Next credits expire in {{ daysToNextExpiry }} day(s).</label>
        </div>
        <div
          v-else-if="remainingThisPeriod < 100"
          class="credits__tooltip-row"
        >
          <label>This team has less than 100 hours of annotation time left.</label>
        </div>
        <div
          v-else
          class="credits__tooltip-row"
        >
          This team has no hours assigned.
        </div>
      </template>
    </v-popover>

    <add-credits :team="team" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TeamPayload } from '@/store/modules/admin/types'
import { CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import { dateDiff, dateUtcNow, dateFromUtcISO } from '@/utils'
import {
  adaptAdminTeamPayload,
  annotationCreditsBilledNextPeriod,
  annotationCreditsRemainingThisPeriod,
  annotationCreditsBilledThisPeriod
} from '@/utils/billing'

import AddCredits from './AddCredits.vue'

// `undefined` means "use default client locale"
const format = (value: number): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: 0 })

@Component({ name: 'credit-v3', components: { AddCredits } })
export default class CreditV3 extends Vue {
  @Prop({ required: true })
  team!: TeamPayload

  // info UI

  get subscription (): CustomerSubscriptionPayload {
    if (!this.team.customer_v3) { throw new Error('BillingV3 team missing customer information') }
    return this.team.customer_v3.customer_subscription
  }

  get adaptedInfo (): ReturnType<typeof adaptAdminTeamPayload> {
    return adaptAdminTeamPayload(this.team)
  }

  get billedThisPeriod (): number {
    return annotationCreditsBilledThisPeriod(this.adaptedInfo)
  }

  get billedThisPeriodFormatted (): string {
    return format(this.billedThisPeriod)
  }

  get remainingThisPeriod (): number {
    return annotationCreditsRemainingThisPeriod(this.adaptedInfo)
  }

  get remainingThisPeriodFormatted (): string {
    return format(this.remainingThisPeriod)
  }

  get billedNextPeriod (): number {
    return annotationCreditsBilledNextPeriod(this.adaptedInfo)
  }

  get billedNextPeriodFormatted (): string {
    return format(this.billedNextPeriod)
  }

  get daysToNextExpiry (): number | null {
    if (!this.team.credit_next_expiry) { return null }
    const nextExpiry = dateFromUtcISO(this.team.credit_next_expiry)
    const now = dateUtcNow()
    const diff = dateDiff(nextExpiry, now, 'days')
    return Math.ceil(diff)
  }

  get closeToExpiry (): boolean {
    return !!this.daysToNextExpiry && this.daysToNextExpiry <= 7
  }

  get fewCreditsLeft (): boolean {
    return this.remainingThisPeriod < 100
  }
}
</script>
<style lang="scss" scoped>
.credits {
  @include row--right;
  width: 100%;
}

.credits__info {
  margin-right: 10px;
}

.credits__info--critical {
  font-weight: bold;
  color: $colorPink;
}

.credits__tooltip-row {
  min-width: 150px;
  margin: 10px;
  @include row--distributed;
}

.credits__tooltip-row label {
  font-weight: bold;
}
</style>
