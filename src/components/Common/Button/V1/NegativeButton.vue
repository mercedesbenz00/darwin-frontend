<template>
  <button-template
    v-bind="$attrs"
    class="negative-button"
    v-on="$listeners"
  >
    <slot>LABEL MISSING!</slot>
  </button-template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ButtonTemplate from './ButtonTemplate.vue'

export default defineComponent({
  name: 'NegativeButton',
  components: { ButtonTemplate }
})
</script>

<style lang="scss" scoped>
.negative-button {
  @include row--center;

  border: 1px solid $colorCrimson;
  font-family: $fontFamilyMulish;
  font-weight: bold;

  color: $colorCrimson;
  background-color: rgba($colorCrimsonLight, 0.2);

  &:hover {
    background-color: $colorCrimson;
    color: $colorWhite;
  }

  &:active {
    background-color: rgba($colorCrimson, 0.8);
  }
}
</style>
