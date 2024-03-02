<template>
  <div class="panel">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Base UI component which renders an alice blue panel, with a standard
 * drop shadow and slightly rounded corners.
 */
export default defineComponent({ name: 'AliceBluePanel' })
</script>

<style lang="scss" scoped>
.panel {
  background: $colorAliceBlue;
  box-shadow: $shadowSection;
  border-radius: 5px;
  padding: 40px;
}
</style>
