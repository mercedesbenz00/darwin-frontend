<template>
  <div class="modalv2-footer">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'ModalFooter' })
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modalv2-footer {
  @include col--center;
  width: 100%;
  position: relative;
  padding: 0 0 20px;
}
</style>
