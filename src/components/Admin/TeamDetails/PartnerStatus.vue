<template>
  <team-section class="partner-status">
    <template #title>
      Partner Status
    </template>
    <template #body>
      <div v-if="isPartner">
        This is a partner team
      </div>
      <div v-else-if="isRegular">
        <primary-button
          :disabled="busy"
          @click="requestPartnerConfirmation"
        >
          Convert to partner
        </primary-button>
        <confirmation-dialog
          :loading="busy"
          :name="dialogName"
          title="Are you sure?"
          @confirmed="convertToPartner"
        >
          <template #detail>
            Please confirm you would like to convert this team to a partner. This
            is a process that cannot be easily undone.
          </template>
        </confirmation-dialog>
      </div>
      <div v-else-if="isClient">
        This team is managed by a partner
      </div>
    </template>
  </team-section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import ConfirmationDialog from '@/components/Common/ConfirmationDialog.vue'
import { convertTeamToPartner } from '@/store/modules/admin/actions/convertTeamToPartner'
import { TeamPayload } from '@/store/modules/admin/types'
import { StoreActionPayload } from '@/store/types'

import TeamSection from './TeamSection.vue'

@Component({
  name: 'partner-status',
  components: { ConfirmationDialog, TeamSection }
})
export default class PartnerStatus extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  get isPartner (): boolean {
    return this.team.managed_status === 'partner'
  }

  get isRegular (): boolean {
    return this.team.managed_status === 'regular'
  }

  get isClient (): boolean {
    return this.team.managed_status === 'client'
  }

  readonly dialogName = 'convert-to-partner-confirmation'

  requestPartnerConfirmation (): void {
    this.$modal.show(this.dialogName)
  }

  busy: boolean = false

  async convertToPartner (): Promise<void> {
    this.busy = true

    const payload: StoreActionPayload<typeof convertTeamToPartner> = {
      teamId: this.team.id
    }

    const response = await this.$store.dispatch('admin/convertTeamToPartner', payload)

    if ('error' in response) {
      const content =
        response.error.isValidationError && response.error.managedStatus
          ? `Couldn't convert to partner due to issue with team: ${response.error.managedStatus}`
          : response.error.message

      this.$store.dispatch('toast/warning', { content })
    }

    this.busy = false
  }
}
</script>
