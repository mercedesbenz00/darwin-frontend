<template>
  <div>
    <custom-button
      class="disconnected-model-stage-sidebar-footer__button"
      color="primary"
      flair="rounded"
      full-width
      :disabled="!selectedModelId"
      @click="$emit('connect-model', selectedModelId)"
    >
      Connect model
      <template #suffix-icon>
        <shortcut
          :keys="['⏎']"
          inverted
        />
      </template>
    </custom-button>
    <custom-button
      class="disconnected-model-stage-sidebar-footer__button"
      color="secondary"
      flair="rounded"
      full-width
      size="medium"
      tag="router-link"
      target="_blank"
      to="/models"
      variant="outline"
    >
      Manage models
    </custom-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import Shortcut from '@/components/Common/Shortcut'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'

export default defineComponent({
  name: 'DisconnectedModelStageSidebarFooter',
  components: { CustomButton, Shortcut },
  
  setup () {
    const scene = useWorkflowSceneStore()
    const selectedModelId = computed(() => scene.selectedModelId)
  
    return { selectedModelId }
  }
})
</script>

<style lang="scss" scoped>
.disconnected-model-stage-sidebar-footer__button:not(:last-child) {
  margin-bottom: 8px;
}
</style>
