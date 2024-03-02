<template>
  <button-template
    v-bind="$attrs"
    class="secondary-light-button"
    v-on="$listeners"
  >
    <slot>LABEL MISSING!</slot>
  </button-template>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import ButtonTemplate from './ButtonTemplate.vue'

@Component({
  name: 'secondary-light-button',
  components: { ButtonTemplate }
})
export default class SecondaryLightButton extends Vue { }
</script>

<style lang="scss" scoped>
.secondary-light-button {
  @include row--center;

  color: $colorAliceNight;
  background-color: transparent;
  border: 1px solid $colorAliceNight;

  font-family: $fontFamilyMulish;
  font-weight: normal;

  &:hover {
    background: $colorAliceShadow;
  }

  &:active {
    background: rgba($colorAliceShadow, 0.8);
  }
}
</style>
