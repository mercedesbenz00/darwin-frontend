<template>
  <button-template
    v-bind="$attrs"
    class="secondary-button"
    v-on="$listeners"
  >
    <slot>LABEL MISSING!</slot>
  </button-template>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import ButtonTemplate from './ButtonTemplate.vue'

@Component({
  name: 'secondary-button',
  components: { ButtonTemplate }
})
export default class SecondaryButton extends Vue { }
</script>

<style lang="scss" scoped>
.secondary-button {
  @include row--center;

  color: $color90Black;
  background-color: transparent;
  border: 1px solid $color90Black;

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
