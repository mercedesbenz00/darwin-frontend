<template>
  <team-section
    class="storage-v3"
    :active="active"
  >
    <template #title>
      Storage (V3)
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
          Extra storage
        </template>
        <template #value>
          <extra-storage :team="team" />
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
    </template>
  </team-section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { TeamPayload } from '@/store/modules/admin/types'
import { CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import {
  storageBilledThisPeriod,
  adaptAdminTeamPayload,
  storageBilledNextPeriod,
  storageRemainingThisPeriod
} from '@/utils/billing'

import ExtraStorage from './ExtraStorage.vue'
import TeamSection from './TeamSection.vue'
import TeamSectionField from './TeamSectionField.vue'

@Component({
  name: 'storage-v3',
  components: { ExtraStorage, TeamSection, TeamSectionField }
})
export default class CreditsV extends Vue {
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
    return storageBilledThisPeriod(this.adaptedInfo)
  }

  get billedNextPeriod (): number {
    return storageBilledNextPeriod(this.adaptedInfo)
  }

  get used (): number {
    const { subscription } = this
    return subscription ? subscription.storage_used : 0
  }

  get remainingThisPeriod (): number {
    return storageRemainingThisPeriod(this.adaptedInfo)
  }

  format (value: number): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: 3 })
  }
}
</script>
