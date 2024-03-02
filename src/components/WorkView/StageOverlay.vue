<template>
  <div
    class="stage-overlay"
    :class="`stage-overlay--${status}`"
  >
    <div class="stage-overlay__top-label">
      <overlay-tab-icon class="stage-overlay__top-label__icon" />
      <div class="stage-overlay__top-label__text">
        {{ topLabel }}
      </div>
    </div>
    <div
      v-if="centerLabel"
      class="stage-overlay__center-label"
    >
      {{ centerLabel }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import {
  DatasetItemPayload,
  DatasetItemStatus,
  MembershipPayload,
  ReviewStatus,
  StageTimeState,
  StageType,
  UserPayload,
  WorkflowStagePayload,
  WorkflowStageTemplatePayload
} from '@/store/types'

import OverlayTabIcon from './assets/overlay_tab.svg?inline'

enum OverlayStatus {
  None = 'none',
  TimeTravel = 'time-travel'
}

@Component({ name: 'stage-overlay', components: { OverlayTabIcon } })
export default class StageOverlay extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload | null

  @State(state => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload | null

  @State(state => state.workview.selectedStageTemplate)
  template!: WorkflowStageTemplatePayload | null

  @State(state => state.team.memberships)
  memberships!: MembershipPayload[]

  @Getter('stagePreviousStages', { namespace: 'workview' })
  previousStages!: (stage: WorkflowStagePayload) => WorkflowStagePayload[]

  get previousAssignees (): MembershipPayload[] {
    const { stage, memberships } = this
    if (!stage) { return [] }
    const previousStages = this.previousStages(stage)
    if (!previousStages) { return [] }
    return previousStages
      .map(s => memberships.find(m => s.assignee_id === m.user_id))
      .filter((m): m is MembershipPayload => !!m)
  }

  get status (): DatasetItemStatus | OverlayStatus | StageType {
    const { isAssignedToOther, isCurrent, item, stage, template } = this

    if (!item) { return OverlayStatus.None }

    if (item.archived) { return DatasetItemStatus.archived }
    if (item.status === DatasetItemStatus.new) { return OverlayStatus.None }

    if (template && template.stage_number > 1) { return OverlayStatus.TimeTravel }

    if (!stage) { return OverlayStatus.None }

    // stage is set

    if (!isCurrent) { return OverlayStatus.TimeTravel }

    if (stage.type === StageType.Annotate) {
      if (stage.skipped) { return DatasetItemStatus.archived }
      if (isAssignedToOther) { return DatasetItemStatus.annotate }
    }

    if (
      stage.type === StageType.Review &&
      (
        stage.metadata.review_status === ReviewStatus.Archived ||
        stage.metadata.review_status === ReviewStatus.Rejected ||
        stage.skipped
      )
    ) {
      return DatasetItemStatus.archived
    }

    if (stage.type === StageType.Code) { return StageType.Code }
    if (stage.type === StageType.Complete) { return DatasetItemStatus.complete }
    if (stage.type === StageType.Model) { return StageType.Model }
    if (stage.type === StageType.Review) { return DatasetItemStatus.review }

    return OverlayStatus.None
  }

  get assignee (): MembershipPayload | null {
    const { stage, memberships } = this
    if (!stage) { return null }
    return memberships.find(m => m.user_id === stage.assignee_id) || null
  }

  @State(state => state.user.profile)
  user!: UserPayload

  get isAssignedToOther (): boolean {
    const { assignee, user } = this
    return !!assignee && assignee.user_id !== user.id
  }

  @Getter('stageInstanceTimeState', { namespace: 'workview' })
  getTimeState!: (instance: WorkflowStagePayload) => StageTimeState

  get isCurrent (): boolean {
    const { stage } = this
    return !!stage && this.getTimeState(stage) === StageTimeState.Current
  }

  get isKnown (): boolean {
    const { stage } = this
    return !!stage && this.getTimeState(stage) !== StageTimeState.Uknown
  }

  get topLabel (): string | null {
    const { isAssignedToOther, isCurrent, isKnown, item, stage, template, assignee } = this
    if (!item) { return null }

    if (item.archived) { return 'Archived' }
    if (item.status === DatasetItemStatus.new) { return null }

    if (template && template.stage_number > 1) { return 'Time Travel' }

    if (!stage) { return null }

    if (isKnown && !isCurrent) { return 'Time Travel' }
    if (assignee && isAssignedToOther) { return `Assigned to ${assignee.first_name}` }
    if (stage.type === StageType.Annotate) { if (stage.skipped) { return 'Discarded' } }

    if (stage.type === StageType.Review) {
      const { previousAssignees: members } = this
      return members.length === 0
        ? 'Reviewing'
        : `Reviewing ${members.map(m => m.first_name).join(', ')}`
    }

    if (stage.type === StageType.Complete) { return 'Complete' }
    if (stage.type === StageType.Model) { return 'AI Model' }
    if (stage.type === StageType.Code) { return 'Code' }

    return null
  }

  get centerLabel (): string | null {
    const { isCurrent, isKnown, item, stage } = this
    if (!item) { return null }
    if (item.archived) { return item.archived_reason }
    if (item.status === DatasetItemStatus.new) { return null }

    if (!stage) { return null }
    if (isKnown && !isCurrent) { return null }

    if (stage.type === StageType.Annotate) {
      if (stage.skipped) { return stage.skipped_reason }
    }

    if (stage.type === StageType.Review) {
      if (stage.metadata.review_status === ReviewStatus.Approved && stage.skipped) {
        if (stage.skipped) { return `Archived: ${stage.skipped_reason}` }
      }

      if (stage.metadata.review_status === ReviewStatus.Archived) { return 'Archived' }
      if (stage.metadata.review_status === ReviewStatus.Rejected) { return 'Rejected' }
      if (stage.skipped) { return stage.skipped_reason }
    }

    if (stage.type === StageType.Model) { return 'AI Model is running' }
    if (stage.type === StageType.Code) { return 'Custom code is running' }

    return null
  }
}
</script>

<style lang="scss" scoped>
.stage-overlay {
  position: absolute;
  @include fullsize;

  display: grid;
  align-items: center;
  justify-content: center;

  @include workflow-status-border-color;
  @include workflow-status(color, 1.0, '.stage-overlay__top-label svg');
  @include workflow-status(background-color, 0.7, '.stage-overlay__center-label');
  @include workflow-status(border-color, 1, '.stage-overlay__center-label');

  border-style: solid;
  border-width: 5px;

  transition: all .2s ease-in-out;
  transition-property: border-color, border-width;

  pointer-events: none;

  & > * {
    grid-area: 1 / 1 / 1 / 1;
  }

  &--time-travel {
    border-color: $colorBrown;

    svg.stage-overlay__top-label__icon {
      color: $colorBrown;
    }
  }

  &--none {
    border-color: transparent;
    border-width: 0;

    .stage-overlay__top-label {

      .stage-overlay__top-label__icon {
        color: transparent;
      }

      margin-top: -25px;
    }
  }
}

.stage-overlay__top-label {
  height: 30px;

  align-self: start;

  display: grid;
  align-items: top;
  justify-items: center;

  color: $color90Black;
  font-weight: bold;

  margin-top: 0;

  transition: all .2s ease-in-out;
  transition-property: margin-top, opacity;

  user-select: none;

  & > * {
    grid-area: 1 / 1 / 1 / 1;
  }

  svg.stage-overlay__top-label__icon {
    height: 100%;
    transition: all .2s ease-in-out;
    transition-property: color;
  }

  .stage-overlay__top-label__text {
    margin-top: 3px;
  }

}

.stage-overlay__center-label {
  min-width: 165px;
  height: 40px;

  user-select: none;

  display: flex;
  justify-self: center;
  align-items: center;
  justify-content: center;

  color: $colorWhite;
  border-radius: 3px;
  border: 2px solid;

  text-transform: uppercase;
  font-weight: bold;

  transition: all .2s ease-in-out;
  transition-property: background-color, border-color;
}

</style>
