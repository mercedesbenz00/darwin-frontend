<template>
  <div class="color-variants">
    <div
      class="color-variants__color"
      :style="{ background: color }"
      @click="$emit('select', color)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ColorPicker',
  props: {
    color: { required: true, type: String }
  }
})
</script>

<style lang="scss" scoped>
.color-variants {
  @include col;
}

.color-variants__color {
  width: 23px;
  height: 23px;
  border-radius: $border-radius-default;
  transition: all .1s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 10px 0 rgba(145,169,192,.3);
    transform: scale(1.1);
  }

  &:not(:last-child) {
    margin-bottom: 2px;
  }
}
</style>
