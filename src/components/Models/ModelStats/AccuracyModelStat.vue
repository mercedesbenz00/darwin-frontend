<template>
  <model-stat
    name="Accuracy"
    :score="accuracy"
  >
    <template #hero>
      <accuracy-hero />
    </template>
    <template #description>
      <p>
        <strong class="bold">Accuracy</strong>
        is the percentage of predictions our model got right in the test set. It's
        computed by dividing the number of correct predictions by the total number of test examples.
      </p>
    </template>
  </model-stat>
</template>

<script lang="ts">
import { round } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrainedModelPayload } from '@/store/types'

import ModelStat from './ModelStat.vue'
import AccuracyHero from './assets/accuracy.svg?inline'

@Component({ name: 'map-model-stat', components: { ModelStat, 'accuracy-hero': AccuracyHero } })
export default class MAPModelStat extends Vue {
  @Prop({ default: null, type: Object as () => TrainedModelPayload })
  trainedModel!: TrainedModelPayload | null

  get accuracy (): string {
    const { trainedModel } = this
    if (!trainedModel) { return 'N/A' }

    const trainingResult = trainedModel.training_result
    if (trainingResult?.test_metrics?.accuracy) {
      return `${round(trainingResult.test_metrics.accuracy * 100, 2)}%`
    }

    return 'N/A'
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
