<template>
  <vue-slider
    ref="slider"
    v-model="model"
    v-bind="sliderOptions"
  >
    <template #dot="{ focus }">
      <div
        class="slider__dot"
        :class="{ 'slider__dot--focus': focus }"
      >
        <knob-icon class="slider__dot__knob" />
      </div>
    </template>
  </vue-slider>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import vueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

import { KnobIcon } from '@/assets/icons/V1'

@Component({
  name: 'manipulator-slider',
  components: { KnobIcon, vueSlider }
})
export default class ManipulatorSlider extends Vue {
  @Prop({ required: true })
  value!: number

  @Prop({ default: 0 })
  min!: number

  @Prop({ default: 100 })
  max!: number

  get sliderOptions () {
    return {
      eventType: 'auto',
      width: '100%',
      height: 5,
      dotSize: 20,
      min: this.min,
      max: this.max,
      interval: 1,
      show: true,
      speed: 1,
      tooltip: 'none',
      tooltipPlacement: 'top',
      railStyle: {
        background: this.$theme.getColor('colorAliceShadow'),
        backgroundPosition: 'center'
      },
      dotStyle: {},
      processStyle: {
        background: 'transparent'
      },
      tooltipStyle: {}
    }
  }

  get model () {
    return this.value
  }

  set model (val) {
    this.$emit('input', val)
    this.$emit('change', val)
  }
}
</script>

<style lang="scss" scoped>
.slider__dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;

  &:hover, &:active {
    box-shadow: 0px 5px 5px rgba(145, 169, 192, 0.3);
  }
}

.slider__dot--focus {
  background: $colorFeatherLight;

  .slider__dot__knob {
    display: none;
  }
}

.slider__dot__knob {
  width: 100%;
  height: 100%;
}
</style>
