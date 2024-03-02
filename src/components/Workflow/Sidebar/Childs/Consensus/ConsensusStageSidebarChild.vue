<template>
  <div>
    <ConsensusThreshold />
    <div class="add-stages-label">
      Add stages
    </div>
    <div class="wrapper-stage-content">
      <consensus-add-child
        :type="StageType.Annotate"
        @click="onAddStage(StageType.Annotate)"
      />
      <consensus-add-child
        :type="StageType.Model"
        @click="onAddStage(StageType.Model)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { StageType } from '@/store/types/StageType'

import ConsensusAddChild from './ConsensusAddChild.vue'
import ConsensusThreshold from './ConsensusThreshold.vue'

export default defineComponent({
  components: { ConsensusAddChild, ConsensusThreshold },
  name: 'ConsensusStageSidebarChild',
  setup () {
    const store = useStore()
    const scene = useWorkflowSceneStore()

    const onAddStage = (type: StageType): void => {
      const selectedConsensusStage = scene.selectedStage
      if (!selectedConsensusStage) {
        return
      }
      store.dispatch('v2Workflow/createConsensusChildStage', {
        consensusId: selectedConsensusStage.id,
        type,
      })
    }
    return { StageType, onAddStage }
  }
})
</script>
<style lang="scss" scoped>
.wrapper-stage-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-stages-label {
  padding: 12px;
  @include typography(md-1, inter, 500);
}
</style>
