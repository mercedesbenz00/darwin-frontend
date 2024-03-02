<template>
  <div class="modalv2-container">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'ModalContainer' })
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modalv2-container {
  @include col;
  justify-content: center;

  width: 100%;
  max-height: 100%;
  padding: 0 40px;

  position: relative;
  overflow: hidden;

  background: $colorAliceBlue;
  border-radius: 5px;
  box-shadow: $dropshadow;
}
</style>
