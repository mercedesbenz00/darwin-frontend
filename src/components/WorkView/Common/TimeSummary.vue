<template>
  <div class="summary">
    <template v-if="summary && currentDurationData.length > 0">
      <div
        v-for="data in currentDurationData"
        :key="data.key"
        class="summary-item"
      >
        <status-button
          class="summary-item__avatar"
          :type="data.type"
        >
          <team-member-avatar
            v-if="data.membership"
            :member="data.membership"
          />
        </status-button>
        <div class="summary-item__name">
          {{ data.name }}
        </div>
        <annotation-time
          class="summary-item__time"
          :time-in-seconds="data.duration"
        />
      </div>
    </template>
    <template v-else>
      No time tracked yet.
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import AnnotationTime from '@/components/WorkView/Common/AnnotationTime.vue'
import {
  DatasetItemTimeSummaryPayload,
  MembershipPayload,
  WorkflowStagePayload,
  StageType
} from '@/store/types'
import { getFullName } from '@/utils'

import StatusButton from './StatusButton/V1/StatusButton.vue'

type SummaryItem = {
  duration: number
  key: string
  membership?: MembershipPayload
  name: string
  type: WorkflowStagePayload['type']
}

const buildSummaryItem = (
  stage: WorkflowStagePayload,
  memberships: MembershipPayload[],
  userId: number,
  duration: number,
  type: Exclude<
    StageType,
    StageType.Dataset | StageType.Discard | StageType.ConsensusEntrypoint |
    StageType.ConsensusTest | StageType.Logic
  >
): SummaryItem => {
  const key = `${userId}-${stage.id}`
  const membership = memberships.find(m => m.user_id === userId)
  const name = membership ? getFullName(membership) : 'Unknown user'
  return { duration, type, key, membership, name }
}

/**
 * In charge of rendering of a time summary for the specified dataset item
 *
 * Loading is done separately from this component, in `TimeSummaryLoader.ts`
 */
@Component({
  name: 'time-summary',
  components: { AnnotationTime, StatusButton, TeamMemberAvatar }
})
export default class TimeSummary extends Vue {
  @Prop({ required: true, type: Object as () => WorkflowStagePayload })
  stage!: WorkflowStagePayload

  get summary (): DatasetItemTimeSummaryPayload | null {
    const summaries =
      this.$store.state.workview.datasetItemTimeSummaries as DatasetItemTimeSummaryPayload[]
    return summaries.find(s => s.dataset_item_id === this.stage.dataset_item_id) || null
  }

  @State(state => state.team.memberships)
  memberships!: MembershipPayload[]

  /**
   * Returns formatted duration data for this stage, structured so it's easier to render.
   *
   * If the stage is assigned, this array needs to always return at least one
   * item, which is the duration tracked for the stage assignee (0 default).
   */
  get currentDurationData (): SummaryItem[] {
    const { memberships, stage, summary } = this

    const data: SummaryItem[] = []

    const sourceData = summary ? summary.current_workflow.per_stage_per_user : []

    sourceData.filter(d => d.stage_id === stage.id).forEach(d => {
      if (d.type === 'complete') { return }
      if (!d.user_id) { return }
      if (d.duration === 0) { return }
      const item = buildSummaryItem(stage, memberships, d.user_id, d.duration, d.type)
      data.push(item)
    })

    const assigneeHasData =
      data.some(d => d.membership && d.membership.user_id === stage.assignee_id)

    if (stage.assignee_id && !assigneeHasData) {
      const item = buildSummaryItem(stage, memberships, stage.assignee_id, 0, stage.type)
      data.push(item)
    }

    return data
  }
}
</script>

<style lang="scss" scoped>
.summary {
  background: $colorWhite;
  border-radius: 5px;
  color: $color90Black;
  padding: 18px;
  box-shadow: $dropShadowNeutral;
  width: 200px;
  @include typography(md-1, default, 500);
}

.summary-item {
  display: grid;
  grid-auto-columns: max-content;
  grid-gap: 10px;
  grid-template-areas: "avatar name" "duration duration";
  align-content: center;
  margin-bottom: 20px;
}

.summary-item__avatar {
  height: 30px;
  width: 30px;
  grid-area: avatar;
}

.summary-item__name {
  grid-area: name;
  align-self: center;
}

.summary-item__time {
  grid-area: duration;
  justify-content: left;
  justify-self: left;
  background: $colorAliceBlue;
  padding: 6px;
  border-radius: 3px;
}

.summary-item__time :deep(.annotation-time__icon) {
  width: 25px;
  height: 28px;
}
</style>
