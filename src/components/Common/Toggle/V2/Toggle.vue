<template>
  <label :class="['toggle', `toggle--${position}`, `toggle--${size}`]">
    <input
      class="toggle__input"
      type="checkbox"
      :checked="value"
      :disabled="disabled"
      v-on="$listeners"
    >
    <div
      class="toggle__slider"
      @click.stop
    />
    <div
      class="toggle__label"
      v-if="$slots.default"
    >
      <slot />
    </div>
    <div
      class="toggle__tools"
      v-if="$slots.tools"
    >
      <slot name="tools" />
    </div>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TogglePosition, ToggleSize } from './types'

@Component({ name: 'toggle' })
export default class Toggle extends Vue {
  @Prop({ type: Boolean, default: false })
  readonly disabled!: boolean

  @Prop({
    type: String,
    default: TogglePosition.START,
    validator: (p) => Object.values(TogglePosition).includes(p)
  })
  readonly position!: TogglePosition

  @Prop({
    type: String,
    default: ToggleSize.SMALL,
    validator: (s) => Object.values(ToggleSize).includes(s)
  })
  readonly size!: ToggleSize

  @Prop({ type: Boolean, default: false })
  readonly value!: boolean
}
</script>

<style lang="scss" scoped>
$transitionDuration: .1s;

.toggle {
  display: flex;
  align-items: center;
  cursor: pointer;

  &.toggle--end {
    flex-direction: row-reverse;
  }

  &.toggle--start *:not(:last-child) {
    margin-right: 8px;
  }

  &.toggle--end *:not(:last-child) {
    margin-left: 8px;
  }

  .toggle__input {
    display: none;
  }

  .toggle__slider {
    border-radius: 32px;
    background-color: $colorInteractiveSecondaryDefault;
    transition: background-color $transitionDuration;

    &::before {
      content: '';
      display: block;
      aspect-ratio: 1 / 1;
      height: 100%;
      border-radius: 50%;
      background-color: $colorSurfaceDefault;
      transform: translateX(0);
      transition: transform $transitionDuration;
    }
  }

  .toggle__label {
    flex: 1 0 auto;
    text-align: left;
  }

  .toggle__input:checked ~ .toggle__slider {
    background-color: $colorInteractivePrimaryDefault;
    transition: background-color $transitionDuration;

    &::before {
      transition: transform $transitionDuration;
    }
  }

  .toggle__input:disabled ~ .toggle__label {
    color: $colorContentDisabled;
  }

  &.toggle--small {
    .toggle__slider {
      flex: 0 0 26px;
      width: 26px;
      height: 16px;
      padding: 2px;
    }

    .toggle__input:checked + .toggle__slider::before {
      transform: translateX(10px);
    }

    .toggle__label {
      font-size: 13px;
      line-height: 20px;
    }
  }

  &.toggle--large {
    .toggle__slider {
      flex: 0 0 32px;
      width: 32px;
      height: 20px;
      padding: 3px;
    }

    .toggle__input:checked + .toggle__slider::before {
      transform: translateX(12px);
    }

    .toggle__label {
      font-size: 13px;
      line-height: 20px;
    }
  }
}
</style>
