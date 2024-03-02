<template>
  <model-stat
    name="mAP"
    :score="mAP"
  >
    <template #hero>
      <map-hero />
    </template>
    <template #description>
      <p>
        <strong class="bold">Mean Average Precision</strong>
        is measured by taking the mean of all average precisions (the area under a Precision vs
        Recall curve) across all IoU thresholds and for all classes. This metric provides an
        overall model performance, irrespective of any manually set threshold. MaP is a harsh
        measurement, so don’t be scared if its number is low.
      </p>
    </template>
  </model-stat>
</template>

<script lang="ts">
import { round } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrainedModelPayload } from '@/store/types'

import ModelStat from './ModelStat.vue'
import mAPHero from './assets/map.svg?inline'

@Component({ name: 'map-model-stat', components: { ModelStat, 'map-hero': mAPHero } })
export default class MAPModelStat extends Vue {
  @Prop({ default: null, type: Object as () => TrainedModelPayload })
  trainedModel!: TrainedModelPayload | null

  @Prop({ default: null, type: String })
  iouValue!: string

  get mAP (): string {
    const { iouValue, trainedModel } = this
    if (!trainedModel) { return 'N/A' }

    const trainingResult = trainedModel.training_result
    const segmKey = this.mapKey(iouValue)
    if (trainingResult && 'segm' in trainingResult && trainingResult.segm[segmKey]) {
      return `${round(trainingResult.segm[segmKey], 2)}%`
    }

    return 'N/A'
  }

  mapKey (iouValue: string): string {
    if (iouValue === '50%') { return 'AP50' }
    if (iouValue === '75%') { return 'AP75' }
    return 'AP'
  }
}
</script>

<style lang="scss" scoped>
.model-stat__content__description p {
  @include typography(md-1, default);
  padding: 10px;
  text-align: justify;
}

.model-stat__content__description p strong.bold {
  @include typography(md-1, default, bold);
}
</style>
