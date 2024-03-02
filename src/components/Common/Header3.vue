<template>
  <h3>
    <slot />
  </h3>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'Header3' })
</script>

<style lang="scss" scoped>
h3 {
  @include typography(lg-1, inter, bold);
  color: $colorBlack;
}
</style>
