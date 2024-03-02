<template>
  <div
    class="rl__container"
    :class="indicatorSize"
    :style="loaderColors"
  >
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
</template>

<script>
import { computed } from 'vue'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'

export default {
  name: 'RingLoader',
  setup (props) {
    const indicatorSize = computed(
      () => `rl__container--${props.size}`
    )

    const loaderColors = computed(
      () => ({
        '--backRing': props.backRingColor,
        '--frontRing': props.frontRingColor
      })
    )

    return { indicatorSize, loaderColors }
  },
  props: {
    size: {
      type: String,
      default: 'x-small'
    },
    backRingColor: {
      type: String,
      default: colors.colorSurfaceDarken
    },
    frontRingColor: {
      type: String,
      default: colors.colorContentSecondary
    }
  }
}
</script>

<style lang="scss" scoped>
@mixin border($size, $borderSize) {
  width: $size;
  height: $size;

  & > div {
    &:first-child {
      border: $borderSize solid var(--backRing);
    }

    border: $borderSize solid var(--frontRing);
    border-color: var(--frontRing) transparent transparent transparent;
  }
}

.rl__container {
  display: inline-block;
  position: relative;

  & > div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: ring-loader 2.4s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  &--x-small { @include border(12px, 1.5px); }

  &--small { @include border(16px, 2px); }

  &--medium { @include border(20px, 2.5px); }

  &--large { @include border(28px, 3px); }

  &--x-large { @include border(42px, 4px); }
}

.rl__container div:nth-child(1) {
  animation-delay: -0.45s;
}

.rl__container div:nth-child(2) {
  animation-delay: -0.3s;
}

.rl__container div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes ring-loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
