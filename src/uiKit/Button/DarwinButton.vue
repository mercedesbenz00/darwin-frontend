<template>
  <component
    :is="!!to ? 'router-link' : 'button'"
    class="darwin-button"
    :class="{
      [`darwin-button--${kind}`]: true,
      [`darwin-button--${size}`]: true,
      'darwin-button--with-prefix': $slots['prefix'],
      'darwin-button--with-sufix': $slots['sufix']
    }"
    @click="$emit('click')"
  >
    <slot name="prefix" />
    <slot />
    <slot name="sufix" />
  </component>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { RawLocation } from 'vue-router'

/**
 * Base button which should be used across the board, defining 4 different variants.
 *
 * We should avoid adding any additional props or custom behavior to this button.
 * It should be kept as non-specific as possible.
 *
 * If a custom version is needed, it can "inherit" from this one.
 */
export default defineComponent({
  name: 'DarwinButton',
  props: {
    kind: {
      type: String,
      required: true,
      validator: (v: string) => ['primary', 'secondary', 'negative', 'outline'].includes(v)
    },
    size: {
      type: String,
      required: true,
      validator: (v: string) => ['xs', 'sm', 'md', 'lg'].includes(v)
    },
    to: {
      type: [String, Object] as PropType<RawLocation>,
      required: false,
      default: null
    }
  }
})

</script>

<style lang='scss' scoped>
@import '@/uiKit/assets/index.scss';

.darwin-button {
  position: relative;
  transition-property: background-color;
  transition: $transitionDefault;
  display: inline-flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 8px;

  border-radius: 100px;

  &--xs {
    @include fontRegularBody100;
    height: 20px;
    padding: 6px 8px;
  }

  &--sm {
    @include fontRegularBody200;
    height: 32px;
    padding: 6px 12px;
  }

  &--md {
    @include fontRegularBody300;
    height: 36px;
    padding: 8px 16px;
  }

  &--lg {
    @include fontRegularBody500;
    height: 40px;
    padding: 10px 20px;
  }

  &--primary {
    color: $colorNeutralsWhite;
    background: $colorInteractivePrimaryDefault;

    &:hover {
      background-color: $colorInteractivePrimaryHover;
    }

    &:active {
      background-color: $colorInteractivePrimaryPressed;
    }

    &:disabled {
      color: $colorContentDisabled;
      border-color: $colorInteractivePrimaryDisabled;
      background-color: $colorInteractivePrimaryDisabled;
    }
  }

  &--secondary {
    color: $colorContentDefault;
    background-color: $colorInteractiveSecondaryDefault;

    &:hover {
      background-color: $colorInteractiveSecondaryHover;
    }

    &:active {
      background-color: $colorInteractiveSecondaryPressed;
    }

    &:disabled {
      color: $colorContentDisabled;
      border-color: $colorInteractiveSecondaryDisabled;
      background-color: $colorInteractiveSecondaryDisabled;
    }
  }

  &--negative {
    color: $colorNeutralsWhite;
    background: $colorInteractiveNegativeDefault;

    &:hover {
      background-color: $colorInteractiveNegativeHover;
    }

    &:active {
      background-color: $colorInteractiveNegativePressed;
    }

    &:disabled {
      color: $colorContentDisabled;
      border-color: $colorInteractiveNegativeDisabled;
      background-color: $colorInteractiveNegativeDisabled;
    }
  }

  &--outline {
    border: 1px solid $colorStrokeStrong;
    color: $colorContentDefault;
    background: transparent;

    &:hover {
      background-color: $colorNeutrals100;
    }

    &:active {
      background-color: transparent;
    }

    &:disabled {
      color: $colorContentDisabled;
      border-color: $colorInteractiveOutlineDisabled;
      background-color: $colorInteractiveOutlineDisabled;
    }
  }
}
</style>
