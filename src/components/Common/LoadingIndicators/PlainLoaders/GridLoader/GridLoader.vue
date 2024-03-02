<template>
  <div
    class="loader-grid"
    :class="indicatorSize"
  >
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
</template>

<script>
export default {
  name: 'GridLoader',
  props: {
    size: {
      type: String,
      default: 'medium'
    }
  },
  computed: {
    indicatorSize: {
      get () {
        return `loader-grid--${this.size}`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@mixin loader-cell($size, $baseSize, $cellSpacing) {
  position: absolute;
  border-radius: 50%;
  background: $colorNeutralsLight500;
  animation: loader-grid 1.2s linear infinite;

  width: calc((#{$baseSize} - (#{$cellSpacing} * 2)) / 3);
  height: calc((#{$baseSize} - (#{$cellSpacing} * 2)) / 3);

  &:nth-child(1) { @include cel-pos(0, $baseSize, $cellSpacing, 0, 0); }

  &:nth-child(2) { @include cel-pos(-0.4, $baseSize, $cellSpacing, 1, 0); }

  &:nth-child(3) { @include cel-pos(-0.8, $baseSize, $cellSpacing, 2, 0); }

  &:nth-child(4) { @include cel-pos(-0.4, $baseSize, $cellSpacing, 0, 1); }

  &:nth-child(5) { @include cel-pos(-0.8, $baseSize, $cellSpacing, 1, 1); }

  &:nth-child(6) { @include cel-pos(-1.2, $baseSize, $cellSpacing, 2, 1); }

  &:nth-child(7) { @include cel-pos(-0.8, $baseSize, $cellSpacing, 0, 2); }

  &:nth-child(8) { @include cel-pos(-1.2, $baseSize, $cellSpacing, 1, 2); }

  &:nth-child(9) { @include cel-pos(-1.6, $baseSize, $cellSpacing, 2, 2); }
}

@mixin cel-pos($delay, $baseSize, $cellSpacing, $columnIndex, $rowIndex) {
  animation-delay: #{$delay}s;
  top: calc((((#{$baseSize} - (#{$cellSpacing} * 2)) / 3) + #{$cellSpacing}) * #{$rowIndex});
  left: calc((((#{$baseSize} - (#{$cellSpacing} * 2)) / 3) + #{$cellSpacing}) * #{$columnIndex});
}

.loader-grid {
  display: inline-block;
  position: relative;

  &--x-small {
    $baseSize: 32px;
    $cellSpacing: 4px;

    width: $baseSize;
    height: $baseSize;

    & > div {
      @include loader-cell('x-small', $baseSize, $cellSpacing);
    }
  }

  &--small {
    $baseSize: 38px;
    $cellSpacing: 5px;

    width: $baseSize;
    height: $baseSize;

    & > div {
      @include loader-cell('small', $baseSize, $cellSpacing);
    }
  }

  &--medium {
    $baseSize: 46px;
    $cellSpacing: 6px;

    width: $baseSize;
    height: $baseSize;

    & > div {
      @include loader-cell('medium', $baseSize, $cellSpacing);
    }
  }

  &--large {
    $baseSize: 52px;
    $cellSpacing: 8px;

    width: $baseSize;
    height: $baseSize;

    & > div {
      @include loader-cell('large', $baseSize, $cellSpacing);
    }
  }

  &--x-large {
    $baseSize: 64px;
    $cellSpacing: 12px;

    width: $baseSize;
    height: $baseSize;

    & > div {
      @include loader-cell('x-large', $baseSize, $cellSpacing);
    }
  }
}

@keyframes loader-grid {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
