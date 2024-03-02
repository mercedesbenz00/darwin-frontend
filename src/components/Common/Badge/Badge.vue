<template>
  <component
    :is="tag"
    class="badge"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <span
      class="badge__content"
      :class="{
        [`badge__content--size--${size}`]: true,
        [`badge__content--${label}`]: true,
        'badge__content--high-contrast': highContrast
      }"
      :style="`background-color: ${parsedColor.bg};`"
    >
      <slot name="prefix-icon" />
      <span
        v-tooltip="tooltip"
        class="badge__content__label"
        :class="{
          [`badge__content__label--${iconPosition}`]: true,
          'badge__content__label--capitalize': !noCapitalize,
        }"
        :style="`color: ${parsedColor.text};`"
      >
        {{ label }}
      </span>
      <slot name="suffix-icon">
        <icon-mono-close
          v-if="deletable"
          v-tooltip="tooltipDelete"
          class="badge__content__delete"
          @click.native="$emit('delete', label)"
        />
      </slot>
    </span>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useSlots } from 'vue'

import { IconMonoClose } from '@/assets/icons/V2/Mono'
import { TooltipOptions } from '@/types'
import {
  RGBA,
  getIconPosition,
  ButtonIconPosition,
  anyToRGBA,
  rgbaString,
  encodeString
} from '@/utils'
import { getAutoAnnotationClassColor } from '@/utilsV2'

import { badgeSizeValidator, badgeTagValidator } from './validators'

import { ParsedColorType, BadgeSize, BadgeTag, BadgeProps } from './'

/*
 * Sometimes that UI component is also
 * referred as chip or pill other than badge
 */
export default defineComponent({
  name: 'Badge',
  components: { IconMonoClose },
  props: {
    label: { type: String, default: '' },
    overrideTooltip: { type: String, default: '' },
    size: { type: String as PropType<BadgeSize>, default: 'small', validator: badgeSizeValidator },
    tag: { type: String as PropType<BadgeTag>, default: 'div', validator: badgeTagValidator },
    color: { type: Object as PropType<RGBA> | undefined, default: undefined },
    alpha: { type: Number, default: 0.1 },
    highContrast: { type: Boolean, default: false },
    overrideLabelColor: { default: '', type: String },
    deletable: { type: Boolean, default: false },
    noTooltip: { type: Boolean, default: false },
    noCapitalize: { type: Boolean, default: false }
  },
  setup (props: BadgeProps) {
    const slots = useSlots()

    const hasPrefix = computed((): boolean => {
      return !!slots['prefix-icon']
    })

    const hasSuffix = computed((): boolean => {
      return props.deletable || !!slots['suffix-icon']
    })

    /**
     * Sets icon position automatically instead of passing it as prop. We need that to adjust
     * padding when passing icons/slots
     */
    const iconPosition = computed((): ButtonIconPosition => {
      return getIconPosition(hasPrefix.value, hasSuffix.value)
    })

    const parsedColor = computed((): ParsedColorType => {
      const alphaValue = props.highContrast ? 1 : props.alpha

      let color = props.color
      if (!color) {
        color = anyToRGBA(getAutoAnnotationClassColor(props.label))
      }
      return {
        bg: rgbaString(color, alphaValue),
        text: props.highContrast
          ? 'rgba(255, 255, 255, 1)'
          : props.overrideLabelColor
            ? props.overrideLabelColor
            : rgbaString(color)
      }
    })

    const tooltip = computed((): TooltipOptions | undefined => {
      if (props.noTooltip) { return undefined }
      return {
        placement: 'bottom',
        classes: 'tooltip--badge',
        content: props.tooltip || props.label,
        delay: {
          show: 300,
          hide: 300
        }
      }
    })

    const tooltipDelete = computed((): TooltipOptions | undefined => {
      if (props.noTooltip) { return undefined }
      return {
        placement: 'bottom',
        classes: 'tooltip--badge',
        content: `Delete ${props.tooltip || props.label}`,
        delay: { show: 300, hide: 300 }
      }
    })

    return {
      hasPrefix,
      hasSuffix,
      iconPosition,
      parsedColor,
      tooltip,
      tooltipDelete,
      encodeString
    }
  }
})
</script>

<style lang="scss" scoped>
.badge {
  @include row--center;

  &__content {
    @include row--center;
    align-items: center;
    background-color: $colorStatusWarningSurface;
    transition: background-color 150ms ease;

    &--high-contrast {
      .badge__content__delete path {
        stroke: white !important;
      }
    }

    &--size {
      &--small {
        height: 18px;
        min-width: 18px;
        padding: 0 4px;
        border-radius: 4px;

        .badge__content {
          &__label {
            @include typography(xs, inter, 500);
            line-height: 18px !important;
          }

          &__delete {
            height: 12px;
            min-width: 12px;
            width: 12px;
          }
        }
      }

      &--medium {
        height: 22px;
        min-width: 22px;
        padding: 0 8px;
        border-radius: 6px;

        .badge__content {
          &__label {
            @include typography(lg, inter, 500);
            line-height: 22px !important;
          }

          &__delete {
            height: 14px;
            min-width: 14px;
            width: 14px;
          }
        }
      }

      &--large {
        height: 26px;
        min-width: 26px;
        padding: 0 8px;
        border-radius: 8px;

        .badge__content {
          &__label {
            @include typography(xl, inter, 500);
            line-height: 26px !important;
          }

          &__delete {
            height: 16px;
            min-width: 16px;
            width: 16px;
          }
        }
      }
    }

    &__label {
      display: block;
      justify-content: flex-start;
      align-items: center;
      height: 100%;
      color: $colorStatusWarning;
      text-align: center;
      white-space: nowrap;
      @include ellipsis;

      &--capitalize {
        text-transform: capitalize;
      }

      &--left {
        margin: 0 0 0 4px;
      }

      &--right {
        margin: 0 4px 0 0;
      }

      &--both {
        margin: 0 4px;
      }

      &--none {
        margin: 0;
      }
    }

    &__delete {
      opacity: .5;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }

      &:focus,
      &:active {
        outline: none;
      }
    }
  }
}
</style>
