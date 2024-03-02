<template>
  <connected-model-stage-sidebar-child
    v-if="modelId"
    @update-config="updateStageConfig"
  />
  <disconnected-model-stage-sidebar-child
    v-else
    @connect-model="updateStageConfig({ model_id: $event })"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { ModelStageConfigPayload, StageType } from '@/store/types'

import ConnectedModelStageSidebarChild from './Connected.vue'
import DisconnectedModelStageSidebarChild from './Disconnected.vue'

export default defineComponent({
  name: 'ModelStageSidebarChild',
  components: {
    ConnectedModelStageSidebarChild, DisconnectedModelStageSidebarChild
  },
  setup () {
    const scene = useWorkflowSceneStore()
    const stage = computed(() => scene.selectedStage)

    const modelId = computed(() => {
      if (stage.value?.type !== StageType.Model) { return null }
      return stage.value?.config.model_id || null
    })

    const editedWorkflow = useEditedWorkflow()

    const updateStageConfig = (config: Partial<ModelStageConfigPayload>): void => {
      if (!stage.value) { return }

      editedWorkflow.updateStageConfig({
        stageId: stage.value.id,
        config: { ...config }
      })
    }
    return { modelId, updateStageConfig }
  }
})
</script>
