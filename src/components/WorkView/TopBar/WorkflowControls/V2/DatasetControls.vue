<template>
  <div
    v-if="type"
    class="annotate-controls"
  >
    <continue-button
      :type="type"
      @continue="sendToNextStage"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { ContinueButton } from '@/components/WorkView/TopBar/WorkflowControls/Common'
import { useComboHotkeys } from '@/composables/useComboHotkeys'
import { useStore } from '@/composables/useStore'
import { StageActionType, V2WorkflowStageInstancePayload } from '@/store/types'

export default defineComponent({
  name: 'DatasetControls',
  components: { ContinueButton },
  setup () {
    const { dispatch, getters, state } = useStore()

    const instance = computed((): V2WorkflowStageInstancePayload | null => {
      return state.workview.v2SelectedStageInstance
    })

    const type = computed((): StageActionType => {
      return getters['workview/v2StageCurrentAction']
    })

    const sendToNextStage = (): void => {
      dispatch('workview/transitionFromV2DatasetStage')
    }

    useComboHotkeys({
      name: 'DatasetControls',
      key: 'Enter',
      shiftKey: true,
      handler: sendToNextStage
    })

    return {
      instance,
      type,
      sendToNextStage
    }
  }
})
</script>

<style lang="scss" scoped>
.annotate-controls {
  display: grid;
  grid-auto-flow: column;
  column-gap: 8px;
}
</style>
