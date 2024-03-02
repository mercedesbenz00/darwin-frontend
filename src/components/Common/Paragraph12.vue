<template>
  <p>
    <slot />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'Paragraph12' })
</script>

<style lang="scss" scoped>
p {
  @include typography(sm, inter, normal);
  color: $colorBlack;
}
</style>
