<template>
  <button
    class="file-set-delete-button"
    @click="$emit('click')"
  >
    <x-shadow-icon class="file-set-close-icon" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { XShadowIcon } from '@/assets/icons/V1'

export default defineComponent({
  name: 'FileSetDeleteButton',
  components: { XShadowIcon }
})
</script>

<style lang="scss" scoped>
.file-set-delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 15px;
  height: 15px;
  z-index: 999;
  cursor: pointer;
  background: transparent;
  padding: 0;
  @include row--center;

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.5;
  }
}

.file-set-close-icon {
  width: 100%;
  height: 100%;
}
</style>
