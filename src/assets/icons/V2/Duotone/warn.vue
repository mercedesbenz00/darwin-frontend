<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="svgClass"
  >
    <path
      d="M7.92154 5.6C8.60361 4.41861 8.94465 3.82792 9.3899 3.62968C9.77826
         3.45677 10.2217 3.45677 10.6101 3.62968C11.0553 3.82792 11.3964 4.41861
         12.0785 5.6L15.7158 11.9C16.3978 13.0814 16.7389 13.6721 16.6879
         14.1568C16.6435 14.5796 16.4218 14.9637 16.0778 15.2135C15.6835 15.5
         15.0015 15.5 13.6373 15.5H6.36269C4.99854 15.5 4.31647 15.5 3.92217
         15.2135C3.57825 14.9637 3.3565 14.5796 3.31206 14.1568C3.26112 13.6721
         3.60216 13.0814 4.28423 11.9L7.92154 5.6Z"
      fill-opacity="0.24"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M10 7V10.5"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <rect
      x="9.5"
      y="12.5"
      width="1"
      height="1"
      rx="0.5"
    />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

enum WarnVariant {
  RED = 'red',
  ORANGE = 'orange',
  INVERTED = 'inverted'
}

export const variantValidator = (value: WarnVariant): boolean =>
  Object.values(WarnVariant).includes(value)

@Component({ name: 'icon-duotone-warn' })
export default class IconDuotoneWarn extends Vue {
  @Prop({ type: String, default: 'red', validator: variantValidator })
  variant!: WarnVariant

  get svgClass (): string {
    return `warn-icon--${this.variant}`
  }
}
</script>

<style lang="scss" scoped>
.warn-icon {
  &--red {
    & > path {
      &:first-child {
        fill: $colorStatusNegative;
      }

      stroke: $colorStatusNegative;
    }

    & > rect {
      fill: $colorStatusNegative;
      stroke: $colorStatusNegative;
    }
  }

  &--orange {
    & > path {
      &:first-child {
        fill: $colorStatusWarning;
      }

      stroke: $colorStatusWarning;
    }

    & > rect {
      fill: $colorStatusWarning;
      stroke: $colorStatusWarning;
    }
  }

  &--inverted {
    & > path {
      &:first-child {
        fill: none;
      }

      stroke: white;
    }

    & > rect {
      fill: white;
      stroke: white;
    }
  }
}
</style>
