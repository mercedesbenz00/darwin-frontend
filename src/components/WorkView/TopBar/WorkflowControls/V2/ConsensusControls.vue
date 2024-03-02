<template>
  <div
    v-if="!!type && !isMarkedAsReady"
    class="consensus-controls"
  >
    <V2StageSkipButton />
    <ContinueButton
      :type="type"
      :completes-at="completesAt || undefined"
      @continue="sendToNextStage"
      @cancel="cancelSendToNextStage"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import {
  ContinueButton,
  V2StageSkipButton
} from '@/components/WorkView/TopBar/WorkflowControls/Common'
import { useComboHotkeys } from '@/composables/useComboHotkeys'
import { useGoToNextItem } from '@/composables/useGoToNextItem'
import { useStore } from '@/composables/useStore'
import { StageActionType, V2WorkflowStageInstancePayload } from '@/store/types'
import { StageType } from '@/store/types'
import { unixSecondsFromIso } from '@/utils'

export default defineComponent({
  name: 'ConsensusControls',
  components: {
    ContinueButton,
    V2StageSkipButton
  },
  setup () {
    const { dispatch, getters, state } = useStore()
    const { goToNextItem } = useGoToNextItem()

    const assignedStageInstance = computed((): V2WorkflowStageInstancePayload | undefined => {
      return state.workview.v2WorkflowItemState?.current_stage_instances.find(
        // from all of these we need to find the one assigned to us
        i => i.stage.type === StageType.Annotate && i.user_id === state.user.profile?.id
      )
    })

    const type = computed((): StageActionType | null => {
      return getters['workview/v2StageCurrentAction']
    })

    const completesAt = computed((): number | null => {
      if (!assignedStageInstance.value) { return null }
      if (!assignedStageInstance.value.data.scheduled_to_complete_at) { return null }
      return unixSecondsFromIso(assignedStageInstance.value.data.scheduled_to_complete_at)
    })

    const isMarkedAsReady = computed((): boolean => {
      if (!assignedStageInstance.value) {
        return true
      }
      return assignedStageInstance.value.data.active_edge !== null
    })

    const sendToNextStage = (): void => {
      dispatch('workview/markConsensusStageInstanceAsReady')

      goToNextItem()
    }

    const cancelSendToNextStage = (): void => {
      dispatch('workview/cancelV2StageAutoComplete')
    }

    useComboHotkeys({
      name: 'ConsensusControls',
      key: 'Enter',
      shiftKey: true,
      handler: sendToNextStage
    })

    return {
      instance: assignedStageInstance,
      type,
      completesAt,
      sendToNextStage,
      isMarkedAsReady,
      cancelSendToNextStage
    }
  }
})
</script>

<style lang="scss" scoped>
.consensus-controls {
  display: grid;
  grid-auto-flow: column;
  column-gap: 8px;
  height: 100%;
}
</style>
