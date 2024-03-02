<template>
  <div class="modalv2-header">
    <slot name="title" />
    <div
      class="modalv2-header-close-container"
    >
      <slot
        v-if="$slots['close']"
        name="close"
        :close="$emit('close')"
      />
      <button
        v-else
        class="modalv2-header-close"
        @click="$emit('close')"
      >
        &#10005;
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'ModalHeader' })
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modalv2-header {
  @include row--center;
  width: 100%;
  padding: 30px 0 16px;
}

.modalv2-header-close-container {
  position: absolute;
  top: 15px;
  right: 15px;

  @include row--center;
  cursor: pointer;
}

.modalv2-header-close {
  @include noSelect;
  color: $colorAliceNight;
  background: transparent;

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.5;
  }
}
</style>
