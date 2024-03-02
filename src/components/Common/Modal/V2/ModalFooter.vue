<template>
  <div class="modal-footer-v2">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'ModalFooterV2' })
</script>

<style lang="scss" scoped>
.modal-footer-v2 {
  @include row;
  gap: 12px;
  width: 100%;
  position: relative;
  box-shadow: inset 0px 1px 0px $colorBorder;
  background-color: $colorFrame;
}
</style>
