<template>
  <button class="file-set-action-button">
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'FileSetActionButton' })
</script>

<style lang="scss" scoped>
.file-set-action-button {
  width: 31px;
  height: 31px;
  @include row--center;
  border-radius: 3px;

  background: $colorAliceShadowTransparent;
  transition: background 0.2s ease-in-out;
  cursor: pointer;

  &:hover,
  &:active {
    background: $colorAliceShadow;
  }

  & > * {
    width: 15px;
    height: 15px;
  }
}
</style>
