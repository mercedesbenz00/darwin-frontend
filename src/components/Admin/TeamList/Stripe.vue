<template>
  <div class="stripe">
    <div class="stripe__customer">
      {{ customerId }}
    </div>
    <div class="stripe__subscription">
      <div
        class="stripe__subscription__status"
        :class="`stripe__subscription__status--${status}`"
        :title="status"
      />
      <div class="stripe__subscription__id">
        {{ subscriptionId }}
      </div>
    </div>
    <div
      v-if="period"
      class="stripe__period"
    >
      {{ period }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { TeamPayload } from '@/store/modules/admin/types'
import { StripeSubscriptionStatus } from '@/store/modules/billing/types'
import { formatUnixDate } from '@/utils'

@Component({
  name: 'stripe'
})
export default class Stripe extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  get customerId (): string {
    return this.team.stripe_id
  }

  get subscriptionId (): string {
    return this.team.subscription_id
  }

  get periodStart (): string | null {
    const { subscription_period_start: periodStart } = this.team
    if (!periodStart) { return null }
    return formatUnixDate(periodStart, 'DD/MM/YYYY')
  }

  get periodEnd (): string | null {
    const { subscription_period_end: periodEnd } = this.team
    if (!periodEnd) { return null }
    return formatUnixDate(periodEnd, 'DD/MM/YYYY')
  }

  get period (): string | null {
    const { periodStart, periodEnd } = this
    if (!periodStart || !periodEnd) { return null }
    return `${periodStart} - ${periodEnd}`
  }

  get status (): StripeSubscriptionStatus | 'unknown' {
    return this.team.subscription_status || 'unknown'
  }
}
</script>

<style lang="scss" scoped>
.stripe__customer {
  grid-area: customer;
}

.stripe__subscription {
  @include row;
  align-items: center;
}

.stripe__subscription__status {
  height: 1em;
  width: 1em;
  margin-right: 0.5em;

  border-radius: 50%;

  &--active {
    background-color: $colorFeatherLight;
  }

  &--cancelled,
  &--incomplete_expired,
  &--past-due,
  &--unpaid {
    background-color: $colorCrimsonLight;
  }

  &--trialing {
    background-color: $colorEgg;
  }

  &--unknown {
    background-color: $colorAliceNight;
  }
}

</style>
