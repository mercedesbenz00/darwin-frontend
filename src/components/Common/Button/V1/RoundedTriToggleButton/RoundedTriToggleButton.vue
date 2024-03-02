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
import { Component, Vue, Prop } from 'vue-property-decorator'

import { resolveNextTriToggleStatus, TriToggleStatus } from '@/utils'

@Component({ name: 'rounded-tri-toggle-button' })
export default class RoundedTriToggleButton extends Vue {
  @Prop({
    type: String as () => TriToggleStatus,
    default: 'none'
  })
  status!: TriToggleStatus

  onMouseDown (event: MouseEvent) {
    const nextStatus = resolveNextTriToggleStatus(this.status)
    this.$emit('toggle', event)
    this.$emit('update:status', nextStatus)
  }
}
</script>

<style lang="scss" scoped>
.tri-toggle {
  @include row;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid transparent;

  border-radius: 999px;

  cursor: pointer;

  @include typography(md);
  color: $colorSecondaryDark;

  transition: all .2s ease;
  transition-property: border-color, background-color, color;
}

.tri-toggle--none {
  border-color: transparent;
  background-color: transparent;

  &:hover, &:active {
    border-color: $colorAliceShade;
    background-color: $colorAliceShade;
  }
}

.tri-toggle--positive {
  border-color: $colorAliceNight;
  background-color: $colorAliceShadow;

  &:hover, &:active {
    border-color: $colorAliceNight;
    background-color: $colorAliceShadow;
  }
}

.tri-toggle--negative {
  border-color: $colorCrimson;
  background-color: $colorCrimsonDawn;

  &:hover, &:active {
    border-color: $colorCrimson;
    background-color: $colorCrimsonDawn;
  }
}
</style>
