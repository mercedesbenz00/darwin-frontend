<template>
  <button-template
    v-bind="$attrs"
    class="positive-button"
    v-on="$listeners"
  >
    <slot>LABEL MISSING!</slot>
  </button-template>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import ButtonTemplate from './ButtonTemplate.vue'

@Component({
  name: 'positive-button',
  components: { ButtonTemplate }
})
export default class PositiveButton extends Vue { }
</script>

<style lang="scss" scoped>
.positive-button {
  @include row--center;

  color: $colorFeatherTeal;
  background-color: $colorFeatherFadeLight;
  border: 1px solid $colorFeatherLight;

  font-family: $fontFamilyMulish;
  font-weight: bold;

  &:hover {
    background: $colorFeatherLight;
    color: $colorWhite;
  }

  &:active {
    background-color: rgba($colorFeatherLight, 0.8);
    color: $colorWhite;
  }
}
</style>
