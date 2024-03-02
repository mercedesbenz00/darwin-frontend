<template>
  <model-stat name="IoU">
    <template #hero>
      <io-u-hero />
    </template>
    <template #description>
      <p>
        <strong class="bold">Intersection over Union</strong>
        (IoU) is measured as the area of overlap between your model’s prediction and the ground
        truth, divided by their union. IoU gives an idea of how much of the total area of an
        object do your predictions tend to cover. Two perfectly overlapping annotations have an
        IoU of 1.00.
      </p>
    </template>
  </model-stat>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ModelStat from './ModelStat.vue'
import IoUHero from './assets/iou.svg?inline'

export default defineComponent({ name: 'IouModelStat', components: { ModelStat, IoUHero } })
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
