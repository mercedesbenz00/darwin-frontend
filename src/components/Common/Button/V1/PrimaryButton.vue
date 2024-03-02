<template>
  <button-template
    v-bind="$attrs"
    class="primary-button"
    v-on="$listeners"
  >
    <slot>LABEL MISSING!</slot>
  </button-template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ButtonTemplate from './ButtonTemplate.vue'

export default defineComponent({
  name: 'PrimaryButton',
  components: { ButtonTemplate }
})
</script>

<style lang="scss" scoped>
.primary-button {
  @include row--center;

  border: solid 1px $colorFeatherLight;
  color: $colorWhite;
  background-color: $colorFeatherLight;
  box-shadow: 0px 5px 20px 5px rgba($colorFeatherFade, 0);

  font-family: $fontFamilyMulish;
  font-weight: bold;

  will-change: transform;

  &:hover {
    border-color: lighten($colorFeatherLight, 2%);
    background-color: lighten($colorFeatherLight, 2%);
    transform: translateY(-2px);
    box-shadow: 0px 7px 20px 5px rgba($colorFeatherFade, .3), 0px 7px 2px -5px rgba($colorFeatherFade, .2);
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0px 6px 20px 5px rgba($colorFeatherFade, .3), 0px 6px 2px -5px rgba($colorFeatherFade, .2);
  }
}
</style>
