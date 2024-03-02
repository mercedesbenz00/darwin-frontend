<template>
  <h4>
    <slot />
  </h4>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'Header4' })
</script>

<style lang="scss" scoped>
h4 {
  @include typography(md-1, inter, bold);
  color: $colorBlack;
}
</style>
