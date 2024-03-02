<template>
  <vue-draggable-resizable
    ref="draggableResizable"
    class="draggable-resizable"
    :class="{
      ['draggable-resizable--vertical']: vertical,
      ['draggable-resizable--horizontal']: !vertical
    }"
    active
    :axis="vertical ? 'y' : 'x'"
    class-name-handle="draggable-resizable__handler"
    prevent-deactivation
    :draggable="false"
    :h="initialHeightParsed"
    :handles="['tm']"
    :min-height="minHeightParsed"
    :max-height="maxHeightParsed"
    :resizable="true"
  >
    <slot />
  </vue-draggable-resizable>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'

import { useTheme } from '@/composables'

export default defineComponent({
  name: 'DraggableResizable',
  components: { VueDraggableResizable },
  props: {
    initialHeight: { type: [Number, String], default: 320 },
    minHeight: { type: [Number, String], default: 120 },
    maxHeight: { type: [Number, String], default: 120 },
    vertical: { type: Boolean, default: true },
    parentHeight: { type: Number, default: 0 }
  },
  setup (props) {
    const draggableResizable = ref<HTMLDivElement>()

    const theme = useTheme()

    const currentScale = computed((): number => theme.getCurrentScale())

    const toDecimal = (value: string): number => {
      const parsed = parseFloat(value)
      if (!Number.isNaN(parsed)) {
        return parseFloat(value) / 100
      } else {
        return 0
      }
    }

    const resolveProp = (value: string | number): number => {
      if (typeof value === 'number') {
        return Number(value) * currentScale.value
      } else if (typeof value === 'string' && value.includes('%')) {
        return toDecimal(value) * (props.parentHeight || 1)
      } else if (typeof value === 'string') {
        return Number(value) * currentScale.value
      }
      return 320 * currentScale.value
    }

    const initialHeightParsed = computed((): number => {
      return resolveProp(props.initialHeight)
    })

    const minHeightParsed = computed((): number => {
      return resolveProp(props.minHeight)
    })

    const maxHeightParsed = computed((): number => {
      return resolveProp(props.maxHeight)
    })

    return {
      draggableResizable,
      toDecimal,
      resolveProp,
      currentScale,
      initialHeightParsed,
      minHeightParsed,
      maxHeightParsed
    }
  }
})
</script>

<style lang="scss" scoped>
.draggable-resizable {
  position: relative;
  background: $colorWhite;
  box-shadow: $shadowS;
  overflow: hidden;
  border: none;
  transform: none !important;

  &--vertical {
    @include col;
    width: 100% !important;
  }

  &--horizontal {
    @include row;
    height: 100% !important;
  }

  :deep(.draggable-resizable__handler) {
    position: absolute;
    width: 100%;
    height: 2px;
    border: none;
    background: transparent;
    cursor: ns-resize;

    &:hover,
    &:active {
      background: $colorInteractivePrimaryDefault;
    }
  }
}
</style>
