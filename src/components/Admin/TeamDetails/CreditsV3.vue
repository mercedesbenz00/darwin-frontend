<template>
  <team-section
    class="credits-v3"
    :active="active"
  >
    <template #title>
      Credits (V3)
    </template>
    <template #body>
      <team-section-field>
        <template #label>
          Billed this period
        </template>
        <template #value>
          {{ format(billedThisPeriod) }}
        </template>
      </team-section-field>
      <team-section-field>
        <template #label>
          Billed next period
        </template>
        <template #value>
          {{ format(billedNextPeriod) }}
        </template>
      </team-section-field>
      <team-section-field>
        <template #label>
          Bonus
        </template>
        <template #value>
          {{ format(bonus) }}
        </template>
      </team-section-field>
      <team-section-field>
        <template #label>
          Used
        </template>
        <template #value>
          {{ format(used) }}
        </template>
      </team-section-field>
      <team-section-field>
        <template #label>
          Remaining this period
        </template>
        <template #value>
          {{ format(remainingThisPeriod) }}
        </template>
      </team-section-field>
      <team-section-field>
        <template #label>
          Seconds per automation action
        </template>
        <template #value>
          <seconds-per-automation-action
            class="credits-v3__field__value"
            :team="team"
          />
        </template>
      </team-section-field>
    </template>
  </team-section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { TeamPayload } from '@/store/modules/admin/types'
import { CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import {
  adaptAdminTeamPayload,
  annotationCreditsBilledNextPeriod,
  annotationCreditsBilledThisPeriod,
  annotationCreditsRemainingThisPeriod
} from '@/utils/billing'

import SecondsPerAutomationAction from './SecondsPerAutomationAction.vue'
import TeamSection from './TeamSection.vue'
import TeamSectionField from './TeamSectionField.vue'

@Component({
  name: 'credits-v3',
  components: { SecondsPerAutomationAction, TeamSection, TeamSectionField }
})
export default class CreditsV3 extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  get active (): boolean {
    return !!this.team.customer_v3
  }

  get subscription (): CustomerSubscriptionPayload | null {
    return this.team.customer_v3 ? this.team.customer_v3.customer_subscription : null
  }

  get adaptedInfo (): ReturnType<typeof adaptAdminTeamPayload> {
    return adaptAdminTeamPayload(this.team)
  }

  get billedThisPeriod (): number {
    return annotationCreditsBilledThisPeriod(this.adaptedInfo)
  }

  get billedNextPeriod (): number {
    return annotationCreditsBilledNextPeriod(this.adaptedInfo)
  }

  get bonus (): number {
    const { subscription } = this
    return subscription ? subscription.annotation_credits_bonus : 0
  }

  get used (): number {
    const { subscription } = this
    return subscription ? subscription.annotation_credits_used : 0
  }

  get remainingThisPeriod (): number {
    return annotationCreditsRemainingThisPeriod(this.adaptedInfo)
  }

  format (value: number): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: 3 })
  }
}
</script>
