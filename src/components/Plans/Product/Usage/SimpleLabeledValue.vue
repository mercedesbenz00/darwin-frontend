<template>
  <div class="simple-labeled">
    <span class="simple-labeled__label"><slot name="label" /></span>
    <span class="simple-labeled__value"><slot name="value" /></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'SimpleLabeledValue' })
</script>

<style lang="scss" scoped>
.simple-labeled {
  @include row--center;
}

.simple-labeled__label {
  @include typography(md, inter);
  color: $colorAliceNight;
  margin-right: 10px;
}

.simple-labeled__value {
  @include typography(lg-1, inter, bold);
  color: $color90Black;
}
</style>
