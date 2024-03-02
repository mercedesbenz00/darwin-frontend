<template>
  <div class="general-threshold">
    <div class="description">
      Intersection over Union (IoU) measures the overlap between two
      annotations. Higher IoU indicates higher consensus.
    </div>
    <ThresholdSlider
      :value="value"
      @change="onChange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { V2ConsensusStagePayload, V2TestStagePayload } from '@/store/types'

import ThresholdSlider from './ThresholdSlider.vue'

/**
 * @Component General threshold'
 */
export default defineComponent({
  name: 'GeneralThreshold',
  components: { ThresholdSlider },
  props: {
    consensusStage: {
      type: Object as () => V2ConsensusStagePayload,
      required: true,
    },

    testStage: {
      type: Object as () => V2TestStagePayload,
      required: true,
    },
  },
  setup (props) {
    const { updateStageConfig } = useEditedWorkflow()

    const onChange = (newValue: number): void => {
      updateStageConfig({
        stageId: props.testStage?.id,
        config: {
          iou_thresholds: {
            ...props.testStage.config.iou_thresholds,
            general_threshold: newValue,
          },
        },
      })
    }
    return {
      value: computed(
        () => props.testStage.config.iou_thresholds.general_threshold
      ),
      onChange,
    }
  },
})
</script>

<style lang="scss" scoped>
.general-threshold {
  background: white;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.description {
  @include typography(md-1, inter, 500);
}
</style>
