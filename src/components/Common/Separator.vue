<template>
  <div class="separator">
    <span><slot /></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'Separator' })
</script>

<style lang="scss" scoped>
.separator {
  position: relative;
  width: 100%;
  color: $colorGrayLite;
  display: flex;
  justify-content: center;
  z-index: 0;
  font-size: .75em;

  span {
    background: #fff;
    padding: 0 .5rem;
  }

  &::before {
    content: '';
    border-top: 1px solid;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    z-index: -1;
  }
}
</style>
