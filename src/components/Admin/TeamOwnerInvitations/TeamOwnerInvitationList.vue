<template>
  <div class="team-owner-invitation-list">
    <input-field
      label="Team owner email"
      class="team-owner-invitation-list__input"
      :placeholder="'Create a new invitation'"
      :value="newInvitationEmail"
      @change="newInvitationEmail = $event"
    />
    <div class="team-owner-invitation-list__credit-group">
      <input-field
        label="Initial credit amount (hours)"
        class="team-owner-invitation-list__credit-amount"
        :value="selectedCreditAmountHours"
        @input="$event => selectedCreditAmountHours = $event"
      />
      <input-field
        label="Days until credit expiration, counted from team creation date"
        class="team-owner-invitation-list__credit-expiration"
        :value="creditExpirationInDays"
        type="number"
        min="1"
        max="730"
        @change="creditExpirationInDays = $event"
      />
      <positive-button @click="createTeamOwnerInvitation">
        Create invitation
      </positive-button>
    </div>

    <v-table
      class="team-owner-invitation-list__table"
      :columns="columns"
      :data="teamOwnerInvitations"
      :options="options"
    >
      <div
        slot="team_id"
        slot-scope="{ row }"
      >
        <router-link
          v-if="row.team"
          :to="`teams/${row.team.id}`"
        >
          {{ row.team.name }}
        </router-link>
        <span v-else>❌</span>
      </div>
      <div
        slot="credit_amount"
        slot-scope="{ row }"
      >
        {{ Math.round(row.creditAmount / 3600) }}
      </div>
      <div
        slot="credit_expiration_in_days"
        slot-scope="{ row }"
      >
        {{ row.creditExpirationInDays }} days
      </div>
    </v-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { Table } from '@/components/Common/Table/V1'
import { createTeamOwnerInvitation } from '@/store/modules/admin/actions/createTeamOwnerInvitation'
import { TeamOwnerInvitation } from '@/store/modules/admin/types'
import { StoreActionPayload } from '@/store/types'

@Component({
  name: 'team-owner-invitation-list',
  components: {
    InputField,
    'v-table': Table
  }
})
export default class TeamOwnerInvitationList extends Vue {
  @State(state => state.admin.teamOwnerInvitations)
  teamOwnerInvitations!: TeamOwnerInvitation[]

  selectedCreditAmountHours = 20
  newInvitationEmail = ''
  creditExpirationInDays = 14
  columns = ['id', 'email', 'team_id', 'credit_amount', 'credit_expiration_in_days']
  options = {
    headings: {
      id: 'ID',
      email: 'Email',
      fulfilled: 'Confirmed',
      credit_amount: 'Credit Amount',
      credit_expiration_in_days: 'Credit Expiration'
    },
    filterable: ['email'],
    sortable: ['id', 'email', 'team_id', 'credit_amount', 'credit_expiration_in_days']
  }

  async createTeamOwnerInvitation () {
    if (!this.newInvitationEmail) { return }

    const payload: StoreActionPayload<typeof createTeamOwnerInvitation> = {
      email: this.newInvitationEmail,
      creditAmount: this.selectedCreditAmountHours * 3600,
      creditExpirationInDays: this.creditExpirationInDays
    }

    const { error } = await this.$store.dispatch('admin/createTeamOwnerInvitation', payload)

    if (error) {
      this.$store.dispatch('toast/warning', { content: 'Invitation could not be sent' })
      return
    }

    this.$store.dispatch('toast/notify', { content: 'Invitation sent successfully' })
    this.newInvitationEmail = ''
  }
}
</script>

<style lang="scss" scoped>
.team-owner-invitation-list__input {
  margin-bottom: 20px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.team-owner-invitation-list__table .VueTables__search-field {
  margin-bottom: 10px;
}

.team-owner-invitation-list__table table {
  border: 1px solid #ddd;
  border-collapse: collapse;
}

.team-owner-invitation-list__table td, th {
  white-space: nowrap;
  border: 1px solid #ddd;
  padding: 20px;
}

.team-owner-invitation-list__table th {
  background-color: #eee;
  position: sticky;
  top: -1px;
  z-index: 2;

  // The first cell that lives in the top left of our spreadsheet
  &:first-of-type {
    left: 0;
    z-index: 3;
  }
}

// The first column that we want to stick to the left
.team-owner-invitation-list__table tbody tr td:first-of-type {
  background-color: #eee;
  position: sticky;
  left: -1px;
  z-index: 1;
}

.team-owner-invitation-list__table .VuePagination {
  margin-top: 10px;
}

.team-owner-invitation-list__table .VueTables__search-field label {
  display: none;
}

.team-owner-invitation-list__table .VueTables__search-field input {
  background-color: $colorLineGrey;
  border-radius: 2px;
  padding: 5px 10px;
}

.team-owner-invitation-list__credit-group {
  display: flex;
  justify-content: space-between;
  max-width: 800px;
}

.team-owner-invitation-list__credit-amount {
  max-width: 300px;
  align-self: flex-end;
}

.team-owner-invitation-list__credit-expiration {
  max-width: 300px;
  align-self: flex-end;
}

.team-owner-invitation-list__credit-group button {
  align-self: flex-end;
}
</style>
