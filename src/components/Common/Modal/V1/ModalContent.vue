<template>
  <div class="modalv2-content">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'ModalContent' })
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modalv2-content {
  width: 100%;
  position: relative;
  padding: 0;
  flex: 1;
}
</style>
