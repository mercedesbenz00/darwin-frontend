<template>
  <NoWorkflowControls v-if="isNoWorkflow" />
  <BackToThePresent v-else-if="isTimeTravel" />
  <span v-else-if="isWebhook" />
  <div v-else-if="!isReadonly">
    <AnnotateControls v-if="isAnnotate" />
    <DatasetControls v-else-if="isDataset" />
    <ReviewControls v-else-if="isReview" />
    <CompleteControls v-else-if="isComplete" />
    <ConsensusControls v-else-if="isConsensus" />
    <DiscardControls v-else-if="isDiscard" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import {
  AnnotateControls,
  BackToThePresent,
  CompleteControls,
  ConsensusControls,
  DatasetControls,
  DiscardControls,
  NoWorkflowControls,
  ReviewControls,
} from '@/components/WorkView/TopBar/WorkflowControls/V2'
import { useAuth, useStore } from '@/composables'
import {
  MembershipRole,
  StageType,
  V2InstanceStatus,
  V2ConsensusStagePayload,
} from '@/store/types'

export default defineComponent({
  name: 'V2WorkflowControls',
  components: {
    AnnotateControls,
    BackToThePresent,
    CompleteControls,
    ConsensusControls,
    DatasetControls,
    DiscardControls,
    ReviewControls,
    NoWorkflowControls
  },
  setup () {
    const { state } = useStore()

    const { isAuthorized } = useAuth()
    const itemState = computed(() => state.workview.v2WorkflowItemState)
    const stage = computed(() => state.workview.v2SelectedStage)
    const instance = computed(() => state.workview.v2SelectedStageInstance)

    const v2Instance = computed(() => state.workview.v2SelectedStageInstance)

    const allowedRoles: MembershipRole[] = ['workforce_manager']

    const v2AccessType = computed<'view' | 'review' | 'annotate'>(() => {
      const authorized = v2Instance.value?.user_id
        ? isAuthorized(
          'update_stage',
          { subject: 'stage', resource: { assignee_id: v2Instance.value.user_id } },
          allowedRoles
        )
        : isAuthorized('assign_items', { subject: 'all', resource: null }, allowedRoles)

      if (!authorized) { return 'view' }

      if (v2Instance.value) {
        const isCurrent = v2Instance.value.status === V2InstanceStatus.Current
        if (!isCurrent) { return 'view' }

        const stage = v2Instance.value.stage

        if (stage?.type === StageType.Review && stage?.config.readonly) { return 'review' }
        if (stage?.type === StageType.Review) { return 'annotate' }
        if (stage?.type === StageType.Annotate) { return 'annotate' }
        if (stage?.type === StageType.Dataset) { return 'annotate' }
        if (stage?.type === StageType.Complete) { return 'view' }
      }

      return authorized ? 'annotate' : 'view'
    })

    const stageType = computed((): StageType | null => {
      if (!stage.value) { return null }
      return stage.value.type
    })

    const isConsensus = computed((): boolean => {
      const consensusInternalStageIds = new Set(
        itemState.value?.workflow.stages
          .filter(
            (stage): stage is V2ConsensusStagePayload =>
              stage.type === StageType.ConsensusEntrypoint
          )
          .flatMap((cs) => [
            cs.config.test_stage_id,
            ...cs.config.parallel_stage_ids,
          ]) ?? []
      )
      const isCurrentInternalStage = !!stage.value && consensusInternalStageIds.has(stage.value.id)
      return !!itemState.value &&
      (stageType.value === StageType.ConsensusEntrypoint || isCurrentInternalStage)
    })

    const isAnnotate = computed((): boolean =>
      !isConsensus.value && !!itemState.value && stageType.value === StageType.Annotate
    )

    const isReview = computed((): boolean =>
      !!itemState.value && stageType.value === StageType.Review
    )

    const isDataset = computed((): boolean =>
      !!itemState.value && stageType.value === StageType.Dataset
    )

    const isComplete = computed((): boolean =>
      !!itemState.value && stageType.value === StageType.Complete
    )

    const isDiscard = computed((): boolean =>
      !!itemState.value && stageType.value === StageType.Discard
    )

    const isWebhook = computed((): boolean =>
      !!itemState.value && stageType.value === StageType.Webhook
    )

    const isTimeTravel = computed((): boolean =>
      !!itemState.value && (!instance.value || instance.value.status !== V2InstanceStatus.Current)
    )

    const isNoWorkflow = computed((): boolean =>
      !instance.value && !itemState.value?.workflow
    )

    const isReadonly = computed(() => {
      return v2AccessType.value === 'view'
    })

    return {
      isAnnotate,
      isComplete,
      isConsensus,
      isDataset,
      isDiscard,
      isNoWorkflow,
      isReadonly,
      isReview,
      isTimeTravel,
      isWebhook
    }
  }
})
</script>
