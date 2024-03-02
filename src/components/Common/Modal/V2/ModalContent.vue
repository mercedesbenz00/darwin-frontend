<template>
  <div class="modal-content-v2">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'ModalContentV2' })
</script>

<style lang="scss" scoped>
.modal-content-v2 {
  @include col;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  align-items: flex-start;
}
</style>
