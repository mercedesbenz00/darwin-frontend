<template>
  <model-stat name="Precision">
    <template #hero>
      <precision-hero />
    </template>
    <template #description>
      <p>
        <strong class="bold">Precision</strong> is measured by dividing true
        positive predictions (correct ones) by true positives + false positives.
        Precision measures how often an object is correctly identified once it
        is found, and is a good measure of false positive rate (an object is
        predicted, but isn't really there) but does not take into account fales
        negatives (an object is present, but is not predicted).
        Model predictions falling below 50% IoU to the ground truth
        are considered false positives, such as the over-predicted tree in the
        diagram, which should take up a smaller area than the prediction.
      </p>
    </template>
  </model-stat>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ModelStat from './ModelStat.vue'
import PrecisionHero from './assets/precision.svg?inline'

export default defineComponent({
  name: 'PrecisionModelStat',
  components: { ModelStat, PrecisionHero }
})
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
