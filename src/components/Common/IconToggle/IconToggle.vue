<template>
  <button
    class="icon-toggle"
    :class="{
      ['icon-toggle--active']: active
    }"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div class="icon-toggle__content">
      <slot />
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * @Component IconToggle
 * ~ Button to toggle something with a displayed icon
 * @param {string} active
 * */

export default defineComponent({
  name: 'IconToggle',
  props: {
    active: {
      default: false,
      type: Boolean
    }
  }
})
</script>

<style lang="scss" scoped>
.icon-toggle {
  transition: background 150ms ease;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 36px;
  border-radius: 10px;

  padding: 4px;
  margin: 0;

  background: $colorSurfaceRaise;

  &:hover {
    background: $colorInteractiveSecondaryHover;
  }

  &--active {
    & > div {
      border: 1.5px solid $colorInteractivePrimaryDefault;
    }
  }
}

.icon-toggle__content {
  transition: border 150ms ease;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  padding: 0 12px;

  border-radius: 6px;
  border: 1.5px solid $colorSurfaceDefault;

  background: $colorSurfaceDefault;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.06), 0px 0px 1px rgba(0, 0, 0, 0.04),
    0px 2px 4px -1px rgba(49, 51, 53, 0.08);
}
</style>
