<template>
  <p>
    <slot />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'Paragraph14' })
</script>

<style lang="scss" scoped>
p {
  @include typography(md-1, inter, normal);
  color: $color90Black;
}
</style>
