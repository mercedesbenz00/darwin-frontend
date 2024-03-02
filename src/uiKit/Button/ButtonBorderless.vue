<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({

})
</script>
<template>
  <button
    class="borderless"
    @click="$emit('click')"
  >
    <slot name="prefix" />
    <slot>No label given</slot>
  </button>
</template>
<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

.borderless {
  height: 36px;
  display: flex;
  flex-direction: row;
  gap: 2px;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border-radius: $borderRadius10;

  padding: $spacing-3 $spacing-5;

  transition-property: background-color;
  transition: $transitionDefault;

  @include fontUI700;

  &:hover {
    background-color: $colorSurfaceElevate;
  }
}

</style>
