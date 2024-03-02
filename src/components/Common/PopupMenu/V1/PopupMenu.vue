<template>
  <div class="popup-menu">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'PopupMenu' })
</script>

<style lang="scss" scoped>
.popup-menu {
  @include col;
  align-items: center;
  row-gap: 2px;

  padding: 5px;
  background: $colorAliceBlue;
  box-shadow: $dropShadowNeutral;
  border-radius: 5px;
}
</style>
