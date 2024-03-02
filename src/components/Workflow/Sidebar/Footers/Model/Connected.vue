<template>
  <div>
    <custom-button
      class="connected-model-stage-sidebar-footer__button"
      color="secondary"
      flair="rounded"
      full-width
      size="medium"
      tag="router-link"
      target="_blank"
      :to="modelRoute"
    >
      Manage model
    </custom-button>
    <custom-button
      class="connected-model-stage-sidebar-footer__button"
      color="negative"
      flair="rounded"
      full-width
      @click="$emit('disconnect-model')"
    >
      Disconnect model
    </custom-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import { useStore } from '@/composables'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { StageType } from '@/store/types'

export default defineComponent({
  name: 'ConnectedModelStageSidebarFooter',
  components: { CustomButton },
  props: {
    buttonClass: { type: String, required: false, default: '' }
  },
  setup () {
    const store = useStore()
    const models = computed(() => store.state.neuralModel.runningSessions)

    const scene = useWorkflowSceneStore()
    const stage = computed(() => {
      if (scene.selectedStage?.type !== StageType.Model) { return null }
      return scene.selectedStage
    })

    const model = computed(() => {
      if (!stage.value) { return null }
      return models.value.find((model) => model.id === stage.value?.config.model_id) || null
    })

    const modelRoute = computed(() => {
      if (!model.value) { return null }
      return `/models/${model.value.id}` 
    })

    return { modelRoute }
  }
})
</script>

<style lang="scss" scoped>
.connected-model-stage-sidebar-footer__button:not(:last-child) {
  margin-bottom: 8px;
}
</style>
