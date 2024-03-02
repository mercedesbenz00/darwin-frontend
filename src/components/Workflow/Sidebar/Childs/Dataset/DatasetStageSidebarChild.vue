<template>
  <div class="dataset-sidebar-child__container">
    <dataset-stage-sidebar-child-connected v-if="isConnected" />
    <dataset-stage-sidebar-child-disconnected v-else />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import DatasetStageSidebarChildConnected
  from '@/components/Workflow/Sidebar/Childs/Dataset/Connected.vue'
import DatasetStageSidebarChildDisconnected
  from '@/components/Workflow/Sidebar/Childs/Dataset/Disconnected.vue'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'

export default defineComponent({
  name: 'DatasetStageSidebarChild',
  components: {
    DatasetStageSidebarChildConnected,
    DatasetStageSidebarChildDisconnected
  },
  setup () {
    const scene = useWorkflowSceneStore()
    const stage = scene.selectedStage

    const isConnected = computed<boolean>(() => {
      if (!stage) { return false }
      if (!('dataset_id' in stage.config)) { return false }
      return !!stage.config.dataset_id
    })

    return { isConnected }
  }

})
</script>

<style lang="scss" scoped>
.dataset-sidebar-child__container {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
