<template>
  <!--
    An item could be in an auto-complete stage instance, in which case, having
    status of new, processing or uploading trumps having a workflow.

    It could also be archived, where the same applies.

    In all those cases, the actual item status should be shown, not the type of
    instance it's in.
  -->
  <status-button
    v-tooltip="tooltip"
    class="status-icon"
    :class="`status-icon--${status}`"
    :type="status"
  >
    <team-member-avatar
      v-if="assignee"
      class="instance__avatar"
      :member="assignee"
    />
  </status-button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import {
  ASSIGNABLE_STATUSES,
  NON_WORKFLOW_STATUSES
} from '@/components/DatasetManagement/Status/utils'
import StatusButton from '@/components/WorkView/Common/StatusButton/V1/StatusButton.vue'
import {
  getDatasetItemStatusLabel,
  DatasetItemPayload,
  DatasetItemStatus,
  MembershipPayload,
  StageType
} from '@/store/types'
import { getFullName } from '@/utils'

/** Renders status as an icon, based on the provided key */
@Component({
  name: 'dataset-item-status-icon',
  components: { StatusButton, TeamMemberAvatar }
})
export default class DatasetItemStatusIcon extends Vue {
  @Prop({ required: true, type: Object as () => DatasetItemPayload })
  item!: DatasetItemPayload

  get assigneeId (): number | null {
    const { item } = this

    if (!ASSIGNABLE_STATUSES.includes(item.status)) {
      return null
    }

    // this is a Workflows 2.0 item
    if (item.workflow_item) {
      return item.workflow_item.current_stage_instances[0]?.user_id || null
    }

    // this is a Workflows 1.0 item
    if (item.current_workflow) {
      const currentStages = item.current_workflow.stages[item.current_workflow.current_stage_number]
      const stage = currentStages.find(s => !!s.assignee_id)
      return stage?.assignee_id || null
    }

    return null
  }

  @Prop({ required: false, type: Boolean, default: false })
  showTooltip!: boolean

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  get assignee (): MembershipPayload | null {
    const { assigneeId, memberships } = this
    if (assigneeId === null) { return null }
    return memberships.find(m => m.user_id === assigneeId) || null
  }

  get status (): DatasetItemStatus | StageType {
    // an archived item doesn't necessarily have the archived status
    // this needs verification
    if (this.item.archived) { return DatasetItemStatus.archived }

    // archived, error, upload, processing or new just show the item status
    // note that item could be new when in the default-auto-complete workflow
    if (NON_WORKFLOW_STATUSES.includes(this.item.status)) {
      return this.item.status
    }

    if (this.item.current_workflow) {
      const stageNumber = this.item.current_workflow.current_stage_number
      const stage = this.item.current_workflow.stages[stageNumber][0]
      return stage.type
    }

    if (this.item.workflow_item) {
      const instance = this.item.workflow_item.current_stage_instances[0]

      const stage = this.item.workflow_item.workflow.stages.find(s => s.id === instance.stage_id)
      if (stage) { return stage.type }
    }

    return this.item.status
  }

  get tooltip (): string | undefined {
    const { showTooltip, status, assignee } = this
    if (status === DatasetItemStatus.annotate && !!assignee) {
      const fullName = getFullName(assignee)
      return `Being annotated by ${fullName}`
    }

    if (status === DatasetItemStatus.review && !!assignee) {
      const fullName = getFullName(assignee)
      return `Being reviewed by ${fullName}`
    }

    return showTooltip
      ? getDatasetItemStatusLabel(status)
      : undefined
  }
}
</script>

<style lang="scss" scoped>
.status-icon {
  display: flex;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.status-icon.status-button {
  @include workflow-status-background-color;
  color: $colorWhite;
}

.status-icon--uploading,
.status-icon--processing {
  background: transparent;
  border: transparent;

  :deep(svg) {
    height: 100%;
    width: 100%;
  }
}

.status-icon.status-icon--new {
  background: $colorAliceShade;
  border-color: $colorAliceShade;
}

.status-icon.status-icon--new:hover {
  background: $colorAliceShade;
  border-color: $colorAliceShade;
}
</style>
