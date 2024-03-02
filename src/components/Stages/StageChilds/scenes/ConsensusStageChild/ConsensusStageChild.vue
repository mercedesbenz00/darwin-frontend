<template>
  <div>
    <ConsensusNode
      :test-stage="testStage"
      :scale="scale"
      variant="accepted"
    />
    <ConsensusNode
      :test-stage="testStage"
      :scale="scale"
      variant="rejected"
    />
    <div
      v-if="!config.parallel_stage_ids.length"
      class="wrapper-add-stages-button"
    >
      <custom-button
        flair="rounded"
        variant="outline"
        full-width
      >
        Add Stages <icon-mono-chevron-right class="chevron-icon" />
      </custom-button>
    </div>
    <div
      v-else
      class="wrapper-sub-stages-cards"
    >
      <ConsensusStageChildItem
        v-for="subStage in parallelStages"
        :stage="subStage"
        :scale="scale"
        :key="subStage.id"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { IconMonoChevronRight } from '@/assets/icons/V2/Mono'
import { CustomButton } from '@/components/Common/Button/V2'
import ConsensusNode from '@/components/Stages/StageChilds/scenes/ConsensusStageChild/ConsensusNode.vue'
import { useStore } from '@/composables/useStore'
import { V2ConsensusStagePayload } from '@/store/types/V2WorkflowStagePayload'

import ConsensusStageChildItem from './ConsensusStageChildItem.vue'

export default defineComponent({
  name: 'ConsensusStageChild',
  components: {
    ConsensusNode,
    CustomButton,
    IconMonoChevronRight,
    ConsensusStageChildItem,
  },
  props: {
    scale: { type: Number, required: true },
    stage: { required: true, type: Object as () => V2ConsensusStagePayload },
  },
  setup (props) {
    const config = computed(() => props.stage.config)
    const isEmpty = computed(() => props.stage.config.parallel_stage_ids)
    const store = useStore()
    const testStage = computed(() =>
      store.state.v2Workflow.editedWorkflow?.stages.find(
        (s) => s.id === props.stage.config.test_stage_id
      )
    )
    const parallelStages = computed(() =>
      store.state.v2Workflow.editedWorkflow?.stages.filter((s) =>
        props.stage.config.parallel_stage_ids.includes(s.id)
      )
    )

    return { config, isEmpty, testStage, parallelStages }
  },
})
</script>
<style lang="scss" scoped>
.wrapper-add-stages-button {
  padding: 12px;
}

.chevron-icon {
  margin-left: 4px;
}
.wrapper-sub-stages-cards {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow: hidden auto;
}
</style>
