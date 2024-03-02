<template>
  <div class="stage-spacer">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'StageSpacer' })
</script>

<style lang="scss" scoped>
.stage-spacer {
  height: 40px;
  display: grid;
  align-items: center;
}
</style>
