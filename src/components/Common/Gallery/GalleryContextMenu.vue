<template>
  <div class="gallery-context-menu">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'GalleryContextMenu' })
</script>

<style lang="scss" scoped>
// Overlay Menu Styles
.gallery-context-menu {
  position: absolute;
  bottom: 20px;
  display: grid;

  grid-auto-flow: column;
  column-gap: 1px;

  justify-content: center;
  align-items: stretch;
  background: $colorAliceShadow;
  box-shadow: 0px 20px 100px rgba(4, 22, 57, 0.25), 0px 1px 2px rgba(4, 22, 57, 0.05);
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;

  & > *,
  :deep(.v-popover),
  :deep(.v-popover) .trigger {
    height: 100%;
  }

  // Fix vor v-popover giving triggers "display: inline-block;"
  // which causes whitespace issues
  :deep(.v-popover) .trigger {
    display: block !important;
  }
}
</style>
