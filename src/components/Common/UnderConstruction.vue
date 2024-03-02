<template>
  <div class="under-construction">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Helper component, used to overlay a construction emoji over a piece of UI.
 * Wont work perfectly in every situation, but does try to overlay in a centered way.
 */
export default defineComponent({ name: 'UnderConstruction' })
</script>

<style lang="scss" scoped>
.under-construction {
  display: grid;
}

.under-construction > *,
.under-construction::after {
  grid-area: 1 / 1 / 2 / 2;
  z-index: 1;
}

.under-construction::after {
  font-size: 1em;
  content: "🚧";
  display: grid;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: rgba(0,0,0,0.05);
  z-index: 2;
}
</style>
