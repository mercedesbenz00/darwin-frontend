<template>
  <!--
    Used `mousedown` event handler instead of `click` handler
    because it is being used in `GenericFilter` and
    to override vue-select default selection behavior
    which uses mousedown.
  -->
  <button
    class="tri-toggle"
    :class="`tri-toggle--${status}`"
    @mousedown.stop.prevent="onMouseDown"
  >
    <slot>No slot given!</slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { resolveNextTriToggleStatus, TriToggleStatus } from '@/utils'

export default defineComponent({
  name: 'RoundedTriToggleButton',
  props: {
    status: {
      type: String,
      default: 'none'
    }
  },
  setup (props: { status: TriToggleStatus }, { emit }) {
    const onMouseDown = (event: MouseEvent): void => {
      const nextStatus = resolveNextTriToggleStatus(props.status)
      emit('toggle', event)
      emit('update:status', nextStatus)
    }

    return {
      onMouseDown
    }
  }
})
</script>

<style lang="scss" scoped>
.tri-toggle {
  @include row;
  align-items: center;
  padding: 8px;
  border: 1px solid transparent;

  border-radius: 8px;

  cursor: pointer;

  @include typography(md, inter, 500);
  color: $colorContentDefault;

  transition: all .2s ease;
  transition-property: border-color, background-color, color;
}

.tri-toggle--none {
  background-color: transparent;

  &:hover, &:active {
    background-color: $colorOverlayHover;
  }
}

.tri-toggle--positive {
  background-color: $colorOverlayInteractive;
  color: $colorContentEmphasis;

  &:hover, &:active {
    background-color: $colorOverlayInteractive;
  }
}

.tri-toggle--negative {
  background-color: $colorSolidNegative;

  &:hover, &:active {
    background-color: $colorSolidNegative;
  }
}
</style>
