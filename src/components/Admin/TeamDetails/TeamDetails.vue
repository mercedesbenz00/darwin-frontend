<template>
  <div class="team">
    <h1 class="team__title">
      {{ team.name }} team information
    </h1>
    <div class="team__actions">
      <positive-button @click="joinTeam">
        Add me to this team
      </positive-button>
      <primary-button
        v-if="!team.features.includes('MODEL_STAGE')"
        @click="enableFeature('MODEL_STAGE')"
      >
        Enable AI Stages
      </primary-button>
      <primary-button
        v-if="!team.features.includes('CODE_STAGE')"
        @click="enableFeature('CODE_STAGE')"
      >
        Enable Code Stages
      </primary-button>
      <primary-button
        v-if="!team.features.includes('BLIND_STAGE')"
        @click="enableFeature('BLIND_STAGE')"
      >
        Enable Blind Stages
      </primary-button>
      <primary-button
        v-if="!team.features.includes('VIDEO_STREAM')"
        @click="enableFeature('VIDEO_STREAM')"
      >
        Enable Video Stream
      </primary-button>
      <primary-button
        v-if="!team.features.includes('MODEL_TOOL')"
        @click="enableFeature('MODEL_TOOL')"
      >
        Enable Model Tool
      </primary-button>
    </div>
    <team-section>
      <template #body>
        <team-section-field>
          <template #label>
            Owner
          </template>
          <template #value />
        </team-section-field>
        <team-section-field>
          <template #label>
            Creation Date
          </template>
          <template #value>
            {{ creationDate }}
          </template>
        </team-section-field>
      </template>
    </team-section>
    <team-section>
      <template #title>
        Note
      </template>
      <template #body>
        <team-section-field>
          <template #label />
          <template #value>
            {{ team.note }}
          </template>
        </team-section-field>
      </template>
    </team-section>
    <stripe :team="team" />
    <credits-v3 :team="team" />
    <storage-v3 :team="team" />
    <partner-status :team="team" />
    <team-section>
      <template #title>
        {{ team.user_count }} users
      </template>
      <template #body>
        User list in development
      </template>
    </team-section>
    <team-section>
      <template #title>
        {{ team.dataset_count }} datasets
      </template>
      <template #body>
        Dataset list in development
      </template>
    </team-section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { createTeamFeature } from '@/store/modules/admin/actions/createTeamFeature'
import { TeamPayload } from '@/store/modules/admin/types'
import { FeaturePayload, StoreActionPayload } from '@/store/types'
import { formatDate, getFullName } from '@/utils'

import CreditsV3 from './CreditsV3.vue'
import PartnerStatus from './PartnerStatus.vue'
import StorageV3 from './StorageV3.vue'
import Stripe from './Stripe.vue'
import TeamSection from './TeamSection.vue'
import TeamSectionField from './TeamSectionField.vue'

@Component({
  name: 'team-details',
  components: { CreditsV3, PartnerStatus, StorageV3, Stripe, TeamSection, TeamSectionField }
})
export default class TeamDetails extends Vue {
  @Prop({ required: true, type: Object })
  team!: TeamPayload

  get ownerName (): string {
    return getFullName({
      first_name: this.team.owner_first_name,
      last_name: this.team.owner_last_name
    })
  }

  get ownerEmail (): string {
    return this.team.owner_email
  }

  get creationDate (): string {
    return formatDate(this.team.creation_date, 'MMMM Do, YYYY HH:mm:ss')
  }

  async joinTeam (): Promise<void> {
    const { error } = await this.$store.dispatch('admin/joinTeam', { id: this.team.id })

    if (error) {
      this.$store.dispatch('toast/warning', {
        content: `Could not join ${this.team.name}. Please, refresh and try again.`
      })
      return
    }

    this.$store.dispatch('toast/notify', {
      content: `You've successfully joined ${this.team.name}`
    })
  }

  async enableFeature (feature: FeaturePayload['name']): Promise<void> {
    const { id, name } = this.team
    const payload: StoreActionPayload<typeof createTeamFeature> = {
      teamId: id,
      feature
    }

    const { error } = await this.$store.dispatch('admin/createTeamFeature', payload)

    if (error) {
      const content = `Couldn't enable ${feature} for team ${name}. Please refresh and try again.`
      this.$store.dispatch('toast/warning', { content })
      return
    }

    const content = `You've successfully enabled ${feature} for team ${name}`
    this.$store.dispatch('toast/notify', { content })
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.team {
  background: $colorWhite;
  border-radius: 3px;
  padding: 25px;
  width: auto;
}

.team__title {
  @include typography(xxl, headlines, bold);
  margin-bottom: 25px;
}

.team__actions {
  @include row;
  margin-bottom: 25px;
}

.team__actions a, .team__actions button {
  margin-right: 15px;
}

</style>
