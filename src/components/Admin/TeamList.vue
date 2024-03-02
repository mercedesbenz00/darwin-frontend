<template>
  <div class="team-list">
    <div class="team-list__header">
      <h1>Teams</h1>
    </div>
    <v-table
      class="team-list__table"
      :columns="columns"
      :data="filteredData"
      :options="options"
      :filterable="true"
      :pagination="true"
    >
      <template #filter__credit_running_out_at>
        <input
          v-model="creditRunningOutFilter"
          type="checkbox"
          class="form-control"
        >
        <label>Urgent (within next 3 weeks)</label>
      </template>

      <template #child_row="{ row: team }">
        <text-area
          ref="note"
          theme="light"
          :placeholder="`Create a note for team ${team.name}`"
          :value="team.note"
          @change="editNote(team.id, $event)"
          @enter="updateTeam"
        />
      </template>

      <template #team="{ row: team} ">
        <team-name-column :team="team" />
      </template>

      <template #owner="{ row: team} ">
        <div>{{ getFullName(team) }}</div>
        <div>{{ team.owner_email }}</div>
      </template>

      <template #creation_date="{ row: team }">
        {{ formatDate(team.creation_date) }}
      </template>

      <template #credit_running_out_at="{ row: team }">
        {{ formatDate(team.credit_running_out_at) }}
      </template>

      <template #credit_next_expiry="{ row: team }">
        {{ formatDate(team.credit_next_expiry) }}
      </template>

      <template
        #credit_furthest_expiry="{ row: team }"
      >
        {{ formatDate(team.credit_furthest_expiry) }}
      </template>

      <template #storage="{ row: team }">
        <storage-v3 :team="team" />
      </template>

      <template #credits="{ row: team }">
        <credits-v3 :team="team" />
      </template>

      <template #invoice="{ row: team }">
        <invoice :team="team" />
      </template>

      <template #stripe="{ row: team }">
        <stripe :team="team" />
      </template>

      <template #disabled="{ row: team }">
        <check-box
          :id="team.id"
          :name="team.name"
          :value="team.disabled"
          @change="toggleTeamDisabled"
        />
      </template>

      <template #neural_models_enabled="{ row: team }">
        <check-box
          :id="team.id"
          :name="team.name"
          :value="team.neural_models_enabled"
          @change="toggleNeuralModelsEnabled"
        />
      </template>

      <template #disabled_at="{ row: team }">
        {{ formatDate(team.disabled_at) }}
      </template>
    </v-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TeamNameColumn from '@/components/Admin/TeamList/TeamNameColumn.vue'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { Table } from '@/components/Common/Table/V1'
import TextArea from '@/components/Common/TextArea.vue'
import { updateTeam } from '@/store/modules/admin/actions/updateTeam'
import { TeamPayload } from '@/store/modules/admin/types'
import { StoreActionPayload } from '@/store/types'
import { formatDate, getFullName } from '@/utils'

import CreditsV3 from './TeamList/CreditsV3.vue'
import Invoice from './TeamList/Invoice.vue'
import StorageV3 from './TeamList/StorageV3.vue'
import Stripe from './TeamList/Stripe.vue'

const isLessThan3WeeksAway = (timestamp: string | null) => {
  if (timestamp === null) { return false }
  const runOutDate = new Date(timestamp)
  const threeWeeksFromNow = new Date()
  threeWeeksFromNow.setDate(threeWeeksFromNow.getDate() + 21)
  return runOutDate < threeWeeksFromNow
}

type CustomFields =
  'credits' |
  'invoice' |
  'owner' |
  'storage' |
  'stripe' |
  'team'

type DisardedFields =
  'customer_v3' |
  'features' |
  'last_invoice_amount' |
  'last_invoice_created' |
  'last_invoice_due_date' |
  'last_invoice_pdf' |
  'last_invoice_status' |
  'managed_status' |
  'name' |
  'note' |
  'owner_email' |
  'owner_first_name' |
  'owner_last_name' |
  'slug' |
  'stripe_id' |
  'subscription_id' |
  'subscription_period_end' |
  'subscription_period_start' |
  'subscription_status'

type Column = (keyof Omit<TeamPayload, DisardedFields> | CustomFields)

@Component({
  name: 'team-list',
  components: {
    CheckBox,
    'v-table': Table,
    CreditsV3,
    Invoice,
    StorageV3,
    Stripe,
    TeamNameColumn,
    TextArea
  }
})
export default class TeamList extends Vue {
  @State(state => state.admin.teams)
  data!: TeamPayload[]

  // order is important here. do not auto-sort
  columns: Column[] = [
    'id',
    'team',
    'user_count',
    'dataset_count',
    'owner',
    'stripe',
    'invoice',
    'credit_running_out_at',
    'credit_next_expiry',
    'credit_furthest_expiry',
    'credits',
    'storage',
    'neural_models_enabled',
    'disabled',
    'disabled_at',
    'creation_date'
  ]

  get filteredData () {
    return this.creditRunningOutFilter
      ? this.data.filter(dataPoint => isLessThan3WeeksAway(dataPoint.credit_running_out_at))
      : this.data
  }

  headings: {[k in Column]: string} = {
    id: 'ID',
    team: 'Name (slug)',
    user_count: '# Members',
    dataset_count: '# Datasets',
    owner: 'Owner',
    stripe: 'Stripe',
    creation_date: 'Creation Date',
    credit_running_out_at: 'Pred. Run Out Date',
    credit_next_expiry: 'Soonest Credit Expiry',
    credit_furthest_expiry: 'Latest Credit Expiry',
    credits: 'Credits',
    storage: 'Storage (GB)',
    invoice: 'Last Inv.',
    neural_models_enabled: 'Neural Models',
    disabled: 'Disabled',
    disabled_at: 'Disabled At'
  }

  // makes it so a datepicker is used when filtering by these columns
  // since we don't filter by these columns, the setting does nothing
  // setting is defined for documentation purposes
  dateColumns: Column[] = [
    'creation_date',
    'credit_running_out_at',
    'credit_next_expiry',
    'credit_furthest_expiry',
    'disabled_at'
  ]

  filterable: Column[] = ['team', 'owner']

  sortable: Column[] = [
    'id',
    'team',
    'user_count',
    'dataset_count',
    'credits',
    'storage',
    'invoice',
    'credit_running_out_at'
  ]

  options = {
    headings: this.headings,
    dateColumns: this.dateColumns,
    editableColumns: [],
    filterable: this.filterable,
    filterAlgorithm: {
      owner: (row: TeamPayload, query: string) => {
        // If there are no team members the owner email will be null
        if (row.owner_email === null) { return false }
        const emailMatches = row.owner_email.toLowerCase().includes(query.toLowerCase())
        if (emailMatches) { return true }
        const nameMatches = getFullName({
          first_name: row.owner_first_name,
          last_name: row.owner_last_name
        }).toLocaleLowerCase().includes(query.toLocaleLowerCase())
        return nameMatches
      },
      team: (row: TeamPayload, query: string) =>
        row.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
        row.slug.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    },
    filterByColumn: true,
    sortable: this.sortable,
    sortIcon: {
      base: 'fa fas',
      is: 'fa-sort',
      up: 'fa-sort-alpha-up',
      down: 'fa-sort-alpha-down'
    },
    customSorting: {
      credits (acending: boolean) {
        return (team1: TeamPayload, team2: TeamPayload) => {
          const { customer_subscription: sub1 } = team1.customer_v3
          const { customer_subscription: sub2 } = team2.customer_v3
          const team1Remaining =
            sub1.annotation_credits_standard +
            sub1.annotation_credits_bonus +
            sub1.annotation_credits_used

          const team2Remaining =
            sub2.annotation_credits_standard +
            sub2.annotation_credits_bonus +
            sub2.annotation_credits_used

          if (acending) {
            return team1Remaining >= team2Remaining ? 1 : -1
          } else {
            return team1Remaining <= team2Remaining ? 1 : -1
          }
        }
      },
      storage (acending: boolean) {
        return (team1: TeamPayload, team2: TeamPayload) => {
          const { customer_subscription: sub1 } = team1.customer_v3
          const { customer_subscription: sub2 } = team2.customer_v3
          const team1Remaining = sub1.storage_standard - sub1.storage_used
          const team2Remaining = sub2.storage_standard - sub2.storage_used

          if (acending) {
            return team1Remaining >= team2Remaining ? 1 : -1
          } else {
            return team1Remaining <= team2Remaining ? 1 : -1
          }
        }
      }
    }
  }

  creditRunningOutFilter: boolean = false
  updateParams: StoreActionPayload<typeof updateTeam> | null = null

  editNote (teamId: number, note: string) {
    this.updateParams = { teamId, note }
  }

  toggleTeamDisabled (checkEvent: { id: number, checked: boolean }) {
    const { id: teamId, checked: disabled } = checkEvent
    this.updateParams = { teamId, disabled }
    this.updateTeam()
  }

  toggleNeuralModelsEnabled (checkEvent: { id: number, checked: boolean }) {
    const { id: teamId, checked: neuralModelsEnabled } = checkEvent
    this.updateParams = { teamId, neural_models_enabled: neuralModelsEnabled }
    this.updateTeam()
  }

  async updateTeam () {
    if (!this.updateParams) { return }

    const { teamId } = this.updateParams
    const teamName = this.data.find(team => team.id === teamId)!.name

    const { error } = await this.$store.dispatch('admin/updateTeam', this.updateParams)

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    const { note, disabled, neural_models_enabled: neuralModelsEnabled } = this.updateParams

    if (note !== null && note !== undefined) {
      this.$store.dispatch('toast/notify', {
        content: `Note for team ${teamName} was successfully created`
      })
    } else if (disabled !== null && disabled !== undefined) {
      const content = disabled
        ? `${teamName} was successfully disabled`
        : `${teamName} was successfully enabled`
      this.$store.dispatch('toast/notify', { content })
    } else if (neuralModelsEnabled !== null && neuralModelsEnabled !== undefined) {
      const content = neuralModelsEnabled
        ? `Neural Models access was successfully enabled for ${teamName}`
        : `Neural Models access was successfully disabled for ${teamName}`
      this.$store.dispatch('toast/notify', { content })
    } else {
      this.$store.dispatch('toast/notify', { content: `${teamName} was successfully updated` })
    }
  }

  formatDate (date: string | null) {
    return date ? formatDate(date, 'DD/MM/YYYY') : ''
  }

  getFullName (team: TeamPayload) {
    return getFullName({
      first_name: team.owner_first_name, last_name: team.owner_last_name
    })
  }
}
</script>

<style lang="scss" scoped>
.team-list {
  @include col;
  height: 100%;
  overflow: auto;
}

.team-list__header {
  margin: 39px 50px;
}

.team-list__header h1 {
  @include typography(lg-1, headlines, bold);
}

.team-list__table {
  margin: 0px 50px;
}

:deep(.VueTables__heading) {
  margin-right: .5em;
}

.team-list__table {
  :deep(table) {
    border: 1px solid $colorGrayLite2;
    border-collapse: collapse;
  }

  :deep(td, th) {
    white-space: nowrap;
    border: 1px solid $colorGrayLite2;
    padding: 1em;
  }

  :deep(th) {
    background-color: $colorGrayLiter;
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
  :deep(tbody tr td:first-of-type) {
    background-color: $colorGrayLiter;
    position: sticky;
    left: -1px;
    z-index: 1;
  }

  :deep(.VuePagination) {
    margin-top: 10px;
  }

  :deep(.VueTables__search-field label) {
    display: none;
  }

  :deep(.VueTables__search-field input) {
    background-color: $colorLineGrey;
    border-radius: 2px;
    padding: 5px 10px;
  }

  :deep(.VueTables__child-row-toggler) {
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: block;
    margin: auto;
    text-align: center;
  }

  :deep(.VueTables__child-row-toggler--closed::before) {
    content: "►";
    border: 0;
  }

  :deep(.VueTables__child-row-toggler--open::before) {
    content: "▼";
    border: 0;
  }
}

// Bootstrap Pagination (compiled from https://getbootstrap.com/docs/3.4/customize/)
:deep(.pagination) {
  display: inline-block;
  padding-left: 0;
  margin: 20px 0;
  border-radius: 4px;

  & > li {
    display: inline;

    & > a,
    & > span {
      position: relative;
      float: left;
      padding: 6px 12px;
      margin-left: -1px;
      line-height: 1.42857143;
      color: $colorAssignedBlue;
      text-decoration: none;
      background-color: $colorWhite;
      border: 1px solid $colorGrayLite2;
    }

    & > a:hover,
    & > span:hover,
    & > a:focus,
    & > span:focus {
      z-index: 2;
      color: $colorPrimaryDark;
      background-color: $colorGrayLiter;
      border-color: $colorGrayLite2;
    }

    &:first-child > a,
    &:first-child > span {
      margin-left: 0;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    &:last-child > a,
    &:last-child > span {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }

  & > .active > a,
  & > .active > span,
  & > .active > a:hover,
  & > .active > span:hover,
  & > .active > a:focus,
  & > .active > span:focus {
    z-index: 3;
    color: $colorWhite;
    cursor: default;
    background-color: $colorAssignedBlue;
    border-color: $colorAssignedBlue;
  }

  & > .disabled > span,
  & > .disabled > span:hover,
  & > .disabled > span:focus,
  & > .disabled > a,
  & > .disabled > a:hover,
  & > .disabled > a:focus {
    color: $colorGrayLite;
    cursor: not-allowed;
    background-color: $colorWhite;
    border-color: $colorGrayLite2;
  }
}

:deep(.pagination-lg) {
  & > li > a,
  & > li > span {
    padding: 10px 16px;
    font-size: 18px;
    line-height: 1.3333333;
  }

  & > li:first-child > a,
  & > li:first-child > span {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  & > li:last-child > a,
  & > li:last-child > span {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }
}

:deep(.pagination-sm) {
  & > li > a,
  & > li > span {
    padding: 5px 10px;
    font-size: 12px;
    line-height: 1.5;
  }

  & > li:first-child > a,
  & > li:first-child > span {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  & > li:last-child > a,
  & > li:last-child > span {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
}
</style>
