<template>
  <div class="action-history">
    <div
      v-if="loaded && groupedActions.length === 0"
      class="action-history__no-actions"
    >
      No changes to image status ocurred yet.
    </div>
    <template
      v-for="{ workflowId, templateName, actions } in groupedActions"
      v-else
    >
      <div
        :key="workflowId"
        class="action-history__workflow"
      >
        Workflow: {{ templateName }}
      </div>
      <v-table
        :key="`actions-${workflowId}`"
        striped
        hover
        class="action-history__actions"
        :columns="[
          'user',
          'email',
          { key: 'previous-stage', label: 'Previous Stage' },
          'action',
          { key: 'next-stage', label: 'Next Stage' },
          { key: 'action-date', label: 'Action Date' }
        ]"
        :data="actions"
      >
        <template #user="{ row }">
          {{ getUserName(row.user_id) }}
        </template>
        <template #email="{ row }">
          {{ getEmail(row.user_id) }}
        </template>
        <template #previous-stage="{ row }">
          {{ row.from_type }}
        </template>
        <template #action="{ row }">
          {{ row.type }}
        </template>
        <template #next-stage="{ row }">
          {{ row.to_type }}
        </template>
        <template #action-date="{ row }">
          {{ formatDate(row.inserted_at) }}
        </template>
      </v-table>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import { Table } from '@/components/Common/Table/V1'
import { WorkviewState } from '@/store/modules/workview/state'
import {
  DatasetItemPayload,
  WorkflowActionPayload,
  LoadingStatus,
  MembershipPayload
} from '@/store/types'
import { getFullName, formatDate } from '@/utils'

type GroupedAction = {
  workflowId: number
  templateName: string
  actions: WorkflowActionPayload[]
}

/**
 * Used to render the entire action history for a dataset item.
 */
@Component({
  name: 'action-history',
  components: {
    'v-table': Table
  }
})
export default class ActionHistory extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload

  @State(state => state.workview.workflowActionsLoading)
  status!: LoadingStatus

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  get loaded (): boolean { return this.status === LoadingStatus.Loaded }

  @State(state => state.workview.workflowActions)
  allActions!: WorkviewState['workflowActions']

  get actions (): WorkflowActionPayload[] {
    const { allActions, item } = this
    if (!item) { throw new Error('Dataset item is not set. Component should not be rendered') }
    const itemActions = allActions.find(a => a.datasetItemId === item.id)

    if (itemActions) {
      return [...itemActions.actions].sort((a, b) => (
        a.inserted_at > b.inserted_at ? -1 : 1
      ))
    }

    return []
  }

  get groupedActions (): GroupedAction[] {
    const { actions } = this
    return actions
      .map(a => ({
        workflowId: a.workflow_id,
        templateId: a.workflow_template_id,
        templateName: a.workflow_template_name
      }))
      .filter((a, index, filtered) => filtered
        .findIndex(f => f.workflowId === a.workflowId) === index
      )
      .map(a => ({
        workflowId: a.workflowId,
        templateName: a.templateName,
        actions: actions.filter(o => o.workflow_id === a.workflowId)
      }))
  }

  getMember (userId: number): MembershipPayload | null {
    const { memberships } = this
    return memberships.find(m => m.user_id === userId) || null
  }

  getUserName (userId: number): string {
    const member = this.getMember(userId)
    return member ? getFullName(member) : 'N/A'
  }

  getEmail (userId: number): string {
    const member = this.getMember(userId)
    return member ? member.email : 'N/A'
  }

  formatDate (date: string): string {
    return formatDate(date, 'HH:mm:ss DD/MM/YYYY')
  }
}
</script>

<style lang="scss" scoped>
.action-history {
  color: $colorBlack;
  overflow: auto;
  max-height: 78vh; // HOTFIX: should rely on content size
}

.action-history__no-actions {
  font-weight: normal;
}

.action-history__workflow {
  font-weight: normal;
  margin: 13px 0;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.action-history__actions {
  table {
    td, th {
      font-weight: normal;
      padding: 0 13px;
      font-size: unset;

      &:last-child {
        text-align: right;
      }
    }

    tr {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      padding: 6px 0;
    }
  }
}
</style>
