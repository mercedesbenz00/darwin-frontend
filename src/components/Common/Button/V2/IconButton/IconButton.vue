<template>
  <component
    v-bind="$attrs"
    v-on="$listeners"
    :is="tag"
    class="icon-button"
    :class="{
      [`variant--${variant}`]: true,
      [`color--${color}`]: true,
      [`size--${size}`]: true,
      [`flair--${flair}`]: true,
      [`tag--${tag}`]: true,
    }"
    :disabled="disabled"
    :style="{ 'width': fullWidth ? '100%' : 'auto' }"
  >
    <span class="icon-button__slot">
      <slot />
    </span>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import {
  ButtonColor,
  ButtonFlair,
  IconButtonSize,
  ButtonTag,
  ButtonVariant
} from '@/components/Common/Button/V2'
import {
  colorValidator,
  iconSizeValidator,
  tagValidator,
  flairValidator,
  variantValidator
} from '@/components/Common/Button/V2/validators'

@Component({ name: 'icon-button' })
export default class IconButton extends Vue {
  @Prop({ type: String, default: 'default', validator: variantValidator })
  variant!: ButtonVariant

  @Prop({ type: String, default: 'secondary', validator: colorValidator })
  color!: ButtonColor

  @Prop({ type: String, default: 'small', validator: iconSizeValidator })
  size!: IconButtonSize

  @Prop({ type: String, default: 'soft', validator: flairValidator })
  flair!: ButtonFlair

  @Prop({ type: String, default: 'button', validator: tagValidator })
  tag!: ButtonTag

  @Prop({ type: Boolean, default: false })
  disabled!: boolean // could have been passed from $attrs but's hard to test that way

  @Prop({ type: Boolean, default: false })
  fullWidth!: boolean
}

</script>

<style lang='scss' scoped>
@import "../assets/style/index.scss";

@mixin label($fontBreakpoint) {
  @include typography($fontBreakpoint, inter, 500);
  color: $colorNeutralsLightWhite;
  text-align: center;
  margin-left: 2px;
}

.icon-button {
  @include row--center;
  padding: 0;
  transition: background .3s;

  &.size {
    @each $key in map-keys($sizes) {
      $size: map-get($sizes, $key);
      $height: map-get($size, 'height');
      $icon: map-get($size, 'icon');

      &--#{$key} {
        @include row--center;
        align-items: center;
        padding: 0;

        .icon-button__slot {
          @include row--center;
          align-items: center;
          height: $height;
          width: $height;
        }
      }
    }
  }
}
</style>
