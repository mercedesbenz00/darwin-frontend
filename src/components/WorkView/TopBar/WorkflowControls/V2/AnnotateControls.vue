<template>
  <div class="annotate-controls">
    <v2-stage-skip-button />
    <continue-button
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
import { unixSecondsFromIso } from '@/utils'

export default defineComponent({
  name: 'AnnotateControls',
  components: {
    ContinueButton,
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
      dispatch('workview/setV2AnnotateStageAutoComplete')
      goToNextItem()
    }

    const cancelSendToNextStage = (): void => {
      dispatch('workview/cancelV2StageAutoComplete')
    }

    useComboHotkeys({
      name: 'AnnotateControls',
      key: 'Enter',
      shiftKey: true,
      handler: sendToNextStage
    })

    return {
      instance,
      type,
      completesAt,
      sendToNextStage,
      cancelSendToNextStage
    }
  }
})
</script>

<style lang="scss" scoped>
.annotate-controls {
  display: grid;
  grid-auto-flow: column;
  column-gap: 8px;
  height: 100%;
}
</style>
