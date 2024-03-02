<template>
  <div class="slider">
    <input
      ref="slider"
      id="slider"
      type="range"
      v-bind="$attrs"
      @input="$emit('input', Number($event.target.value))"
      :step="step"
      :value="value"
      :min="min"
      :max="max"
    >
    <div
      class="slider-step"
      :class="`slider-step--${variant}`"
      v-for="(block, index) in blocks"
      :key="index"
      :style="{ '--step': index, '--stepWidth': `${stepWidth}px` }"
    />
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'

import { SliderProps, SliderVariant } from './types'
import { variantValidator } from './validators'

@Component({ name: 'slider' })
export default class Slider extends Vue {
  rootEl: HTMLInputElement | null = null

  @Ref('slider')
  slider!: HTMLInputElement

  @Prop({
    default: SliderVariant.DEFAULT,
    validator: variantValidator,
    type: String
  })
  variant!: SliderProps['variant']

  @Prop({
    default: 0,
    type: Number
  })
  value!: SliderProps['value']

  @Prop({
    default: 0,
    type: Number
  })
  min!: SliderProps['min']

  @Prop({
    default: 100,
    type: Number
  })
  max!: SliderProps['max']

  @Prop({
    default: 25,
    type: Number
  })
  step!: SliderProps['step']

  mounted (): void {
    if (!this.slider) {
      return
    }
    this.rootEl = this.slider
    this.onChange(this.rootEl)
  }

  @Watch('value', { immediate: true })
  onValueChanged (): void {
    if (this.rootEl) {
      this.onChange(this.rootEl)
    }
  }

  onChange (target: HTMLInputElement): void {
    const percentage = Number(this.value) / this.max * 100
    // THIS sort of approach to getting CSS effects (via dom manipulation)
    // should just be dropped altogether
    // eslint-disable-next-line vue/max-len
    target.style.background = `linear-gradient(to right, ${colors.colorInteractivePrimaryDefault} 0%, ${colors.colorInteractivePrimaryDefault} ${percentage}%, ${colors.colorSurfaceRaise} ${percentage}%, ${colors.colorSurfaceRaise} 100%)`
  }

  get blocks (): number {
    return Number((this.max / this.step).toFixed())
  }

  get stepWidth () {
    if (!this.rootEl) {
      return 0
    }
    return this.rootEl.getBoundingClientRect().width / this.blocks
  }
}
</script>

<style lang="scss" scoped>
@mixin thumb {
  // there is currently no name for that shadow
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.04), 0px 0px 4px 1px rgba(0, 0, 0, 0.04),
    0px 3px 6px -1px rgba(49, 51, 53, 0.14);
  border: none;
  height: 12px;
  width: 12px;
  border-radius: 50px;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
}

.slider {
  position: relative;
  display: block;
  width: fit-content;
  height: 6px;
}

.slider-step {
  display: none;
  position: absolute;
  top: 0;
  left: calc(var(--stepWidth, 0) * var(--step, 0));

  background: transparent;
  height: 6px;
  width: var(--stepWidth, 0);

  pointer-events: none;

  &:not(&:last-child) {
    border-right: 1px solid $colorNeutralsLightWhite;
  }

  &--steps {
    display: block;
  }
}

input[type='range'] {
  position: absolute;
  top: 0;
  left: 0;

  border: none;
  border-radius: 4px;
  height: 6px;
  width: 200px;
  outline: none;
  transition: background 450ms ease-in;
  cursor: pointer;

  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    @include thumb;
  }

  &::-moz-range-thumb {
    @include thumb;
  }

  &::-ms-thumb {
    @include thumb;
  }
}
</style>
