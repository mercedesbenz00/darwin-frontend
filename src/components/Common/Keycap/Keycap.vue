<template>
  <div
    class="keycap"
    :class="{
      [`keycap--${size}`]: true,
      'keycap--inverted': inverted
    }"
  >
    <span class="keycap__label">
      <slot />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { KeycapSize } from './types'
import { sizeValidator } from './validators'

export default defineComponent({
  name: 'Keycap',
  props: {
    /**
     * Enables special styling for usage on non-white backgrounds
     * (for example, the blue custom button)
     */
    inverted: {
      required: false,
      default: false,
      type: Boolean
    },
    size: {
      required: false,
      default: KeycapSize.MEDIUM,
      validator: sizeValidator,
      type: String as () => KeycapSize
    }
  }
})
</script>

<style lang="scss" scoped>
.keycap {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  min-width: 24px;
  padding: 0 4px;
  border-radius: 6px;
  background-color: $colorSurfaceDarken;
  font-size: 14px;

  &__label {
    font-family: $fontFamilyInter;
    font-weight: 500;
    line-height: 16px;
    color: $colorContentSecondary;
  }

  &--inverted {
    background-color: currentColor;
    mix-blend-mode: screen;
  }

  &--inverted &__label {
    color: $colorContentSecondary;
  }

  &--small {
    height: 16px;
    min-width: 16px;
    padding: 0 2px;
    border-radius: 4px;
    font-size: 12px;
  }

  &--large {
    height: 32px;
    min-width: 32px;
    border-radius: 8px;
    font-size: 16px;
  }
}
</style>
