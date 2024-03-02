<template>
  <div class="review-controls">
    <v2-stage-skip-button />
    <stage-reject-button @click="reject" />
    <continue-button
      :completes-at="completesAt || undefined"
      :type="type"
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
// import {
//   StageArchiveButton
// } from '@/components/WorkView/TopBar/WorkflowControls/Common/StageArchiveButton/V2'
import {
  StageRejectButton
} from '@/components/WorkView/TopBar/WorkflowControls/Common/StageRejectButton/V2'
import { useComboHotkeys } from '@/composables/useComboHotkeys'
import { useGoToNextItem } from '@/composables/useGoToNextItem'
import { useStore } from '@/composables/useStore'
import { StageActionType, V2WorkflowStageInstancePayload } from '@/store/types'
import { unixSecondsFromIso } from '@/utils'

export default defineComponent({
  name: 'ReviewControls',
  components: {
    ContinueButton,
    StageRejectButton,
    V2StageSkipButton
  },
  setup () {
    const { dispatch, getters, state } = useStore()
    const { goToNextItem } = useGoToNextItem()

    const instance = computed((): V2WorkflowStageInstancePayload | null => {
      return state.workview.v2SelectedStageInstance
    })

    const type = computed((): StageActionType => {
      return getters['workview/v2StageCurrentAction']
    })

    const completesAt = computed((): number | null => {
      if (!instance.value) { return null }
      if (!instance.value.data.scheduled_to_complete_at) { return null }
      return unixSecondsFromIso(instance.value.data.scheduled_to_complete_at)
    })

    const sendToNextStage = (): void => {
      dispatch('workview/approveV2ReviewStage')
      goToNextItem()
    }

    const reject = (): void => {
      dispatch('workview/rejectV2ReviewStage')
    }

    const cancelSendToNextStage = (): void => {
      dispatch('workview/cancelV2StageAutoComplete')
    }

    useComboHotkeys({
      name: 'ReviewControls',
      key: 'Enter',
      shiftKey: true,
      handler: sendToNextStage
    })

    return {
      instance,
      type,
      completesAt,
      sendToNextStage,
      reject,
      cancelSendToNextStage
    }
  }
})
</script>

<style lang="scss" scoped>
.review-controls {
  display: grid;
  grid-auto-flow: column;
  column-gap: 8px;
}
</style>
