<template>
  <button
    class="action-bar-el"
    :class="{
      'action-bar-el--default': active && type === 'default',
      'action-bar-el--select': active && type === 'select'
    }"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      class="action-bar-el__icon-wrapper"
      v-if="!!$slots.prefixComp"
    >
      <slot name="prefixComp" />
    </div>
    <slot>Label</slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from 'vue'

import { ActionBarElement as Types, ActionBarType as ComponentType } from './types'

/**
 * @Component ActionBarElement
 * ~ Wrapper/Template for Default, Danger and Select type
 * @param {string} type Changes appearance based on given type
 * @param {string} active Toggles ActionBars active styles
 * */

export default defineComponent({
  name: 'ActionBarElement',
  props: {
    type: {
      default: ComponentType.DEFAULT,
      type: String
    },
    active: {
      default: false,
      type: Boolean
    }
  },
  setup (props: Types, context: SetupContext) {
    return {
      props,
      context
    }
  }
})
</script>

<style lang="scss" scoped>
.action-bar-el {
  position: relative;

  transition: all 150ms ease;

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;

  padding: 8px 12px 8px 8px;
  margin: 0px;

  border-radius: 100px;
  background: transparent;

  &:hover {
    background: $colorOverlayPressed;
  }

  &--default,
  &--select {
    background: $colorOverlayInteractive;

    &:hover {
      background: $colorOverlayInteractive;
    }

    &:disabled {
      background: transparent;
    }
  }

  &--select {
    background: transparent;
  }

  &:disabled {
    &:hover {
      background: transparent;
    }
  }
}

.action-bar-el__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;

  margin-right: 4px;
}
</style>
