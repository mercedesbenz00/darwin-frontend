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
import { computed, defineComponent } from 'vue'

import OverlayTabIcon from '@/components/WorkView/assets/overlay_tab.svg?inline'
import { useStore } from '@/composables'
import {
  DatasetItemStatus,
  MembershipPayload,
  ReviewStatus,
  StageType,
  V2DatasetItemPayload,
  V2InstanceStatus
} from '@/store/types'

enum OverlayStatus {
  None = 'none',
  TimeTravel = 'time-travel'
}

export default defineComponent({
  name: 'StageOverlay',
  components: { OverlayTabIcon },
  setup () {
    const { state, getters } = useStore()

    const item = computed((): V2DatasetItemPayload | null =>
      getters['workview/v2SelectedDatasetItem']
    )
    const memberships = computed(() => state.team.memberships)
    const selectedStageInstance = computed(() =>
      state.workview.v2SelectedStageInstance
    )
    const stage = computed(() =>
      state.workview.v2SelectedStage
    )
    const user = computed(() => state.user.profile)
    const workflowItemState = computed(() =>
      state.workview.v2WorkflowItemState
    )

    const assignee = computed((): MembershipPayload | null => {
      if (!selectedStageInstance.value) { return null }

      return memberships.value
        .find(m => m.user_id === selectedStageInstance.value?.user_id) || null
    })
    const isSkipped = computed(() => !!selectedStageInstance.value?.data.skipped)
    const skippedReason = computed(() => selectedStageInstance.value?.data?.skipped_reason)

    const isCurrent = computed(() =>
      selectedStageInstance.value?.status === V2InstanceStatus.Current
    )

    const isAssignedToOther = computed((): boolean => {
      return !!assignee.value && assignee.value?.user_id !== user.value?.id
    })

    const previousAssignees = computed((): MembershipPayload[] => {
      if (!stage.value) { return [] }
      const previousStages = workflowItemState.value?.previous_stage_instances
      if (!previousStages) { return [] }
      return previousStages
        .map(s => memberships.value.find(m => s.user_id === m.user_id))
        .filter((m): m is MembershipPayload => !!m)
    })

    const status = computed((): DatasetItemStatus | OverlayStatus | StageType => {
      if (!item.value) { return OverlayStatus.None }

      if (item.value.archived) { return DatasetItemStatus.archived }
      if (item.value.status === DatasetItemStatus.new) {
        return OverlayStatus.None
      }

      if (!stage.value) { return OverlayStatus.None }

      if (!isCurrent.value) { return OverlayStatus.TimeTravel }

      switch (stage.value.type) {
      case StageType.Annotate: {
        if (isSkipped.value) { return DatasetItemStatus.archived }
        if (isAssignedToOther.value) { return DatasetItemStatus.annotate }
        return OverlayStatus.None
      }
      case StageType.Discard: { return DatasetItemStatus.archived }
      case StageType.Review: {
        if (
          selectedStageInstance.value?.data?.active_edge === ReviewStatus.Archived ||
          selectedStageInstance.value?.data?.active_edge === ReviewStatus.Rejected ||
          isSkipped.value
        ) {
          return DatasetItemStatus.archived
        }
        return DatasetItemStatus.review
      }
      case StageType.Code: { return StageType.Code }
      case StageType.Complete: { return DatasetItemStatus.complete }
      case StageType.Model: { return StageType.Model }
      default: {
        return OverlayStatus.None
      }
      }
    })

    const topLabel = computed((): string | null => {
      if (!item.value) { return null }

      if (item.value.archived) { return 'Archived' }
      if (item.value.status === DatasetItemStatus.new) { return null }

      if (!stage.value) { return null }

      if (!isCurrent.value) { return 'Time Travel' }

      if (assignee.value && isAssignedToOther.value) {
        return `Assigned to ${assignee.value.first_name}`
      }

      switch (stage.value.type) {
      case StageType.Annotate: {
        if (isSkipped.value) { return 'Discarded' }
        return null
      }
      case StageType.Discard: { return 'Discarded' }
      case StageType.Review: {
        const lastAssignee = previousAssignees.value.at(-1)
        const previousStageInstance =
          state.workview.v2WorkflowItemState?.previous_stage_instances?.[0]
        if (previousStageInstance?.stage.type === StageType.Test) {
          return 'Reviewing Consensus'
        }

        return lastAssignee
          ? `Reviewing ${lastAssignee.first_name}`
          : 'Reviewing'
      }
      case StageType.Code: { return 'Code' }
      case StageType.Complete: { return 'Complete' }
      case StageType.Model: { return 'AI Model' }
      default: {
        return null
      }
      }
    })

    const centerLabel = computed((): string | null => {
      if (!item.value) { return null }
      if (item.value.archived) { return skippedReason.value || '' }
      if (item.value.status === DatasetItemStatus.new) { return null }

      if (!stage.value) { return null }

      if (!isCurrent.value) { return null }

      switch (stage.value.type) {
      case StageType.Annotate: {
        if (isSkipped.value) {
          return skippedReason.value || ''
        }
        break
      }
      case StageType.Discard: { return 'Discarded' }
      case StageType.Review: {
        // we will implement it later once API will expose this part
        if (
          selectedStageInstance.value?.data?.active_edge === ReviewStatus.Approved &&
          isSkipped.value
        ) {
          return `Archived: ${skippedReason.value}`
        }

        if (selectedStageInstance.value?.data?.active_edge === ReviewStatus.Archived) {
          return 'Archived'
        }
        if (selectedStageInstance.value?.data?.active_edge === ReviewStatus.Rejected) {
          return 'Rejected'
        }
        if (isSkipped.value) { return skippedReason.value || '' }
        break
      }
      case StageType.Code: { return 'Custom code is running' }
      case StageType.Model: { return 'AI Model is running' }
      default: {
        return null
      }
      }

      return null
    })

    return {
      status,
      topLabel,
      centerLabel
    }
  }
})
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
