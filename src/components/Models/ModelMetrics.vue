<template>
  <div class="metrics">
    <div class="metrics__metric">
      <div class="metrics__metric__value">
        {{ mAP }}
        <span
          v-if="mAP !== 'N/A'"
          class="metrics__metric__value__perc"
        >%</span>
      </div>
      <div class="metrics__metric__label">
        mAP
      </div>
    </div>
    <div class="metrics__metric">
      <div class="metrics__metric__value">
        Full
      </div>
      <div class="metrics__metric__label">
        Model Tier
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { round } from 'lodash'
import { Component, Vue, Prop } from 'vue-property-decorator'

import { TrainedModelPayload } from '@/store/types'

@Component({ name: 'model-metrics' })
export default class ModelMetrics extends Vue {
  @Prop({ default: null, type: Object as () => TrainedModelPayload })
  trainedModel!: TrainedModelPayload | null

  get mAP (): string {
    const { trainedModel } = this
    if (!trainedModel) { return 'N/A' }

    const trainingResult = trainedModel.training_result
    if (trainingResult && 'segm' in trainingResult && trainingResult.segm.AP) {
      return `${round(trainingResult.segm.AP, 2)}`
    }

    return 'N/A'
  }
}
</script>
<style lang="scss" scoped>
.metrics {
  display: grid;
  grid-template-columns: auto auto;
}

.metrics__metric {
  text-align: center;
}

.metrics__metric__value {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 15px;
}

.metrics__metric__value__perc {
  font-size: 14px;
}

.metrics__metric__label {
  font-size: 14px;
  color: $colorAliceNight;
}
</style>
