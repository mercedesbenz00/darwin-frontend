<template>
  <p class="modalv2-header-title">
    <slot />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'ModalHeaderTitle' })
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modalv2-header-title {
  @include typography(xl-1, inter, bold);
  text-align: center;
  color: $color90Black;
}
</style>
