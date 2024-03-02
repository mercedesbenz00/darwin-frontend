<template>
  <component
    v-bind="$attrs"
    v-on="$listeners"
    :is="tag"
    class="custom-button"
    :class="{
      [`variant--${variant}`]: true,
      [`color--${color}`]: true,
      [`size--${size}`]: true,
      [`flair--${flair}`]: true,
      [`tag--${tag}`]: true,
      ['custom-button--disabled']: disabled,
      [`custom-button--icon--${iconPosition}`]: true,
    }"
    :disabled="disabled"
    :style="{ 'width': fullWidth ? '100%' : 'auto' }"
  >
    <span
      v-if="hasPrefix"
      class="custom-button__slot"
    >
      <slot name="prefix-icon" />
    </span>
    <h2
      class="custom-button__label"
      :class="{[`custom-button__label--${iconPosition}`]: true}"
    >
      <slot />
    </h2>
    <span
      v-if="hasSuffix"
      class="custom-button__slot"
    >
      <slot name="suffix-icon" />
    </span>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import {
  ButtonColor,
  ButtonFlair,
  CustomButtonSize,
  ButtonTag,
  ButtonVariant
} from '@/components/Common/Button/V2'
import {
  colorValidator,
  buttonSizeValidator,
  tagValidator,
  flairValidator,
  variantValidator
} from '@/components/Common/Button/V2/validators'
import { getIconPosition, ButtonIconPosition } from '@/utils'

@Component({ name: 'custom-button' })
export default class CustomButton extends Vue {
  @Prop({ type: String, default: 'default', validator: variantValidator })
  variant!: ButtonVariant

  @Prop({ type: String, default: 'secondary', validator: colorValidator })
  color!: ButtonColor

  @Prop({ type: String, default: 'medium', validator: buttonSizeValidator })
  size!: CustomButtonSize

  @Prop({ type: String, default: 'soft', validator: flairValidator })
  flair!: ButtonFlair

  @Prop({ type: String, default: 'button', validator: tagValidator })
  tag!: ButtonTag

  @Prop({ type: Boolean, default: false })
  disabled!: boolean // could have been passed from $attrs but's hard to test that way

  @Prop({ type: Boolean, default: false })
  fullWidth!: boolean

  get hasPrefix (): boolean {
    return !!this.$slots['prefix-icon']
  }

  get hasSuffix (): boolean {
    return !!this.$slots['suffix-icon']
  }

  /**
   * Sets icon position automatically instead of passing it as prop. We need that to adjust
   * padding when passing icons/slots
   * */
  get iconPosition (): ButtonIconPosition {
    return getIconPosition(this.hasPrefix, this.hasSuffix)
  }
}

</script>

<style lang='scss' scoped>
@import "../assets/style/index.scss";

.custom-button {
  position: relative;
  @include row--center;
  transition: background-color 150ms ease;

  &.size {
    @each $key in map-keys($sizes) {
      $size: map-get($sizes, $key);
      $height: map-get($size, 'height');

      &--#{$key} {
        &.custom-button {
          $height: map-get($size, 'height');
          $icon: map-get($size, 'slot-icon');
          $shortcut: map-get($size, 'slot-shortcut');
          $p: map-get($size, 'padding');
          $p-slot: map-get($size, 'padding-slot');
          $p-slot: calc(#{$p-slot} - #{$icon});
          $m: map-get($size, 'margin');

          &--icon {
            &--left {
              padding: 0 $p 0 $p-slot;
            }

            &--right {
              padding: 0 $p-slot 0 $p;
            }

            &--both {
              padding: 0 $p;
            }

            &--none {
              padding: 0 $p-slot;
            }
          }

          .custom-button__label {
            @include row--center;
            @include typography(map-get($size, 'typography'), inter, 500);
            height: $height;
            text-align: center;

            &--left {
              margin-left: $m;
            }
            &--right {
              margin-right: $m;
            }
            &--both {
              margin: 0 $m;
            }
            &--none {
              margin: 0;
            }
          }

          .custom-button__slot {
            @include row--center;

            // used to override a svg/shortcut size
            :deep(svg) {
              height: $icon;
              width: $icon;
            }

            .shortcut {
              height: $shortcut;
              width: $shortcut;
            }
          }
        }
      }
    }
  }
}
</style>
