<template>
  <model-stat name="Recall">
    <template #hero>
      <recall-hero />
    </template>
    <template #description>
      <p>
        <strong class="bold">Recall</strong>
        is measured by dividing true positive predictions (correct ones) by true positives +
        false negatives. Recall measures how often an object is found, and is a good measure of
        false negative rate (an objet is present, but isn’t found). Present objects falling
        below 50% IoU to the ground truth are considered false negatives, such as the
        half-predicted car in the diagram.
      </p>
    </template>
  </model-stat>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ModelStat from './ModelStat.vue'
import RecallHero from './assets/recall.svg?inline'

export default defineComponent({ name: 'RecallModelStat', components: { ModelStat, RecallHero } })
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
