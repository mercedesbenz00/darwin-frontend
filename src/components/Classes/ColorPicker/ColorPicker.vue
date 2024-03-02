<template>
  <div class="color-picker">
    <color-variants
      v-for="(color, idx) of colors"
      :key="`color${idx}`"
      class="color-picker__variants"
      :color="color"
      @select="onSelectColor"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import ColorVariants from './ColorVariants.vue'

export default defineComponent({
  name: 'ColorPicker',
  components: { ColorVariants },
  props: {
    colors: { required: true, type: Array as PropType<String[]> }
  },
  setup (props, { emit }) {
    const onSelectColor = (value: string): void => {
      emit('select', value)
    }

    return {
      onSelectColor
    }
  }
})
</script>

<style lang="scss" scoped>
.color-picker {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  padding: 0;
  width: 100%;
  height: 100%;
  border-radius: $border-radius-default;
  background: $colorWhite;

  &__variants {
    display: inline-flex;
    margin: 1px;
    border-radius: $border-radius-default;
  }
}
</style>
