<template>
  <component

    :is="!!to ? 'router-link' : 'button'"
    :to="to"
    class="toggle-button"
    @click="$emit('click')"
  >
    <slot name="prefix" />
    <slot />
    <slot name="sufix" />
  </component>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { RawLocation } from 'vue-router'

export default defineComponent({
  name: 'ToggleButton',
  props: {
    to: {
      type: [String, Object] as PropType<RawLocation>,
      required: false,
      default: null
    }
  }
})

</script>

<style lang='scss' scoped>
@import '@/uiKit/assets/index.scss';

.toggle-button {
  transition-property: background-color;
  transition: $transitionDefault;

  display: inline-flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;

  gap: $spacing-4;

  border: 1px solid $colorStrokeStrong;
  border-radius: $borderRadius10;

  padding: $spacing-3 $spacing-5;

  height: $heightInput;

  background: $colorSurfaceDefault;

  @include fontUI700;
  color: $colorContentDefault;

  &:hover {
    background: $colorSurfaceElevate;
  }

  &:active {
    background: $colorSurfaceDefault;
  }
}
</style>
