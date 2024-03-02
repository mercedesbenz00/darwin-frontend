<template>
  <p class="modal-header-title-v2">
    <slot />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'ModalHeaderTitleV2' })
</script>

<style lang="scss" scoped>
.modal-header-title-v2 {
  @include typography(xl-1, inter, 500);
  text-align: center;
  color: $colorContentSecondary;
}
</style>
