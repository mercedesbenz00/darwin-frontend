<template>
  <vue-slider
    ref="slider"
    v-model="_value"
    v-bind="sliderOptions"
  >
    <template #dot="{ index }">
      <div
        class="slider__dot"
        :class="`slider__dot--${index}`"
      >
        <scrubber-icon class="slider__dot__scrubber" />
      </div>
    </template>

    <template #process="{ style }">
      <div
        class="vue-slider-process slider__process"
        :style="style"
      />
    </template>

    <template #tooltip="{ value }">
      <div class="slider__tooltip">
        {{ value }}
      </div>
    </template>
  </vue-slider>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import vueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

import ScrubberIcon from './assets/scrubber.svg?inline'

@Component({
  name: 'manipulator-double-slider',
  components: { ScrubberIcon, vueSlider }
})
export default class ManipulatorDoubleSlider extends Vue {
  @Prop({ required: true })
  value!: [number, number]

  @Prop({ default: 1 })
  min!: number

  @Prop({ default: 65535 })
  max!: number

  get sliderOptions () {
    return {
      eventType: 'auto',
      enableCross: false,
      width: '100%',
      height: 5,
      dotSize: 2,
      min: this.min,
      max: this.max,
      duration: 0,
      interval: 1,
      show: true,
      speed: 1,
      tooltipPlacement: 'bottom',
      railStyle: {
        background: this.$theme.getColor('colorAliceShadow'),
        backgroundPosition: 'center',
        height: '8px'
      },
      dotStyle: {},
      processStyle: {},
      tooltipStyle: {}
    }
  }

  get _value () {
    return this.value
  }

  set _value (val) {
    this.$emit('input', val)
    this.$emit('change', val)
  }
}
</script>

<style lang="scss" scoped>
.slider__dot {
  width: 2px;
  height: 36px;
  cursor: pointer;
  position: relative;
  background: $colorFeatherLight;
  margin-top: -3px;

  &:hover, &:active {
    box-shadow: 0px 5px 5px rgba(145, 169, 192, 0.3);
  }
}

.slider__dot--0 {
  .slider__dot__scrubber {
    color: $color90Black;
  }
}

.slider__dot--1 {
  .slider__dot__scrubber {
    color: $colorWhite;
  }
}

.slider__dot__scrubber {
  position: absolute;
  top: 0px;
  left: -4px;
  width: 9px;
  height: 36px;
  cursor: pointer;
}

:deep(.vue-slider-dot-tooltip) {
  cursor: pointer;
}

.slider__process {
  background: linear-gradient(90deg, #000000 0%, #FFFFFF 100%), #FFFFFF;
}

.slider__tooltip {
  @include typography(sm);
  @include row--center;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 3px;
  color: #ffffff;
  text-align: center;
  padding: 5px 6px;
  margin-top: 25px;
  cursor: pointer;
}
</style>
