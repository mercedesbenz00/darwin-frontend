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
    variant="inverted"
    size="md"
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

import TeamMemberAvatar from '@/components/Common/Avatar/V2/TeamMemberAvatar.vue'
import {
  ASSIGNABLE_STATUSES,
  NON_WORKFLOW_STATUSES
} from '@/components/DatasetManagement/Status/utils'
import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import {
  getDatasetItemStatusLabel,
  DatasetItemStatus,
  MembershipPayload,
  StageType,
  V2DatasetItemPayload
} from '@/store/types'
import { getFullName } from '@/utils'

/** Renders status as an icon, based on the provided key */
@Component({
  name: 'dataset-item-status-icon',
  components: { StatusButton, TeamMemberAvatar }
})
export default class DatasetItemStatusIcon extends Vue {
  @Prop({ required: true, type: Object as () => V2DatasetItemPayload })
  item!: V2DatasetItemPayload

  get assigneeId (): number | null {
    const { item } = this

    if (!ASSIGNABLE_STATUSES.includes(item.status)) {
      return null
    }

    // this is a Workflows 2.0 item
    if (item.workflow_data) {
      return item.workflow_data.current_stage_instances.find(csi => csi.assignee_id)
        ?.assignee_id || null
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

  @Getter('allConsensusStagesIds', { namespace: 'dataset' })
  allConsensusStagesIds!: string[]

  get assignee (): MembershipPayload | null {
    const { assigneeId, memberships } = this
    if (assigneeId === null) { return null }
    return memberships.find(m => m.user_id === assigneeId) || null
  }

  get status (): DatasetItemStatus | StageType {

    const isWithinConsensus = this.allConsensusStagesIds.includes(
      this.item.workflow_data?.current_stage_instances[0]?.stage_id ?? ''
    )
    if (isWithinConsensus) {
      return StageType.ConsensusEntrypoint
    }
    // archived, error, upload, processing or new just show the item status
    // note that item could be new when in the default-auto-complete workflow
    if (NON_WORKFLOW_STATUSES.includes(this.item.status)) {
      return this.item.status
    }

    if (this.item.workflow_data) {
      const stageInstances = this.item.workflow_data.current_stage_instances
      if (stageInstances.length) {
        return stageInstances[0].stage_type
      }
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
  padding: 0;

  &--uploading,
  &--processing {
    background: transparent;
    border: transparent;

    :deep(svg) {
      height: 100%;
      width: 100%;
    }
  }

  &--archive {
    border-color: $colorStagesAnnotateDefault;
  }

  &--annotate {
    border-color: $colorStagesAnnotateDefault;
  }

  &--review {
    border-color: $colorStagesReviewDefault;
  }

  &--new {
    background: $colorAliceShade;
    border-color: $colorAliceShade;

    &:hover {
      background: $colorAliceShade;
      border-color: $colorAliceShade;
    }
  }

  &.status-button {
    @include workflow-status-background-color;
    color: $colorWhite;
  }
}
</style>
