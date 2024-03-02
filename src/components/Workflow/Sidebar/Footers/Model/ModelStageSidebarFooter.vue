<template>
  <connected-model-stage-sidebar-footer
    v-if="connected"
    @disconnect-model="disconnectModel()"
    @update-config="updateConfig"
  />
  <disconnected-model-stage-sidebar-footer
    v-else
    @connect-model="connectModel"
  />
</template>

<script lang='ts'>
import { computed, defineComponent } from 'vue'

import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { V2ModelStagePayload } from '@/store/types'

import ConnectedModelStageSidebarFooter from './Connected.vue'
import DisconnectedModelStageSidebarFooter from './Disconnected.vue'

export default defineComponent({
  name: 'ModelStageSidebarFooter',
  components: {
    ConnectedModelStageSidebarFooter,
    DisconnectedModelStageSidebarFooter
  },
  setup () {
    const scene = useWorkflowSceneStore()
    const stage = computed(() => scene.selectedStage)

    const connected = computed<boolean>(() =>
      !!stage.value && 'model_id' in stage.value.config && !!stage.value.config.model_id
    )

    const { updateStageConfig } = useEditedWorkflow()

    const connectModel = (modelId: string): void => {
      if (!stage.value) { return }

      updateStageConfig({
        stageId: stage.value.id,
        config: {
          ...stage.value.config,
          model_id: modelId
        }
      })
    }

    const disconnectModel = (): void => {
      if (!stage.value) { return }

      updateStageConfig({
        stageId: stage.value.id,
        config: {
          ...stage.value.config,
          model_id: undefined
        }
      })
    }

    const updateConfig = (config: V2ModelStagePayload['config']): void => {
      if (!stage.value) { return }

      updateStageConfig({
        stageId: stage.value.id,
        config: { ...config }
      })
    }

    return {
      connected,
      connectModel,
      updateConfig,
      disconnectModel
    }
  }
})
</script>
