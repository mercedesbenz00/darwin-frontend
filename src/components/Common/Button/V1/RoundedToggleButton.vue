<template>
  <!--
    Used `mousedown` event handler instead of `click` handler
    because it is being used in `GenericFilter` and
    to override vue-select default selection behavior
    which uses mousedown.
  -->
  <button
    class="toggle"
    :class="{ 'toggle--selected': selected }"
    @mousedown.stop.prevent="$event => $emit('toggle', $event)"
  >
    <div
      v-if="$slots.icon"
      class="toggle__icon"
    >
      <slot name="icon" />
    </div>
    <slot>No slot given!</slot>
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({ name: 'rounded-toggle-button' })
export default class RoundedToggleButton extends Vue {
  @Prop({ type: Boolean, default: false })
  selected!: boolean
}
</script>

<style lang="scss" scoped>
.toggle {
  @include row;
  align-items: center;
  padding: 2px;
  padding-right: 8px;
  border: 1px solid transparent;
  column-gap: 5px;

  // makes it so vertical radius is 50%, creating a pill shape with perfectly
  // rounded corners
  border-radius: 999px;

  cursor: pointer;

  @include typography(md);
  color: $colorSecondaryDark;
  background-color: transparent;

  transition: all .2s ease;
  transition-property: border-color, background-color, color;

  &:hover, &:active {
    border-color: $colorAliceShade;
    background-color: $colorAliceShade;
  }
}

.toggle__icon {
  height: 20px;
  width: 20px;
}

// svg commonly has overflow issue, which is fixed by this
.toggle__icon svg {
  height: 100%;
  width: 100%;
}

.toggle--selected {
  border-color: $colorAliceNight;
  background-color: $colorAliceShadow;

  &:hover, &:active {
    border-color: $colorAliceNight;
    background-color: $colorAliceShadow;
  }
}
</style>
