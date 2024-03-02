<template>
  <div class="double-slider">
    <slider
      class="double-slider__top"
      :value="value"
      :options="topOptions"
      @change="$emit('change', $event)"
    />
    <slider
      class="double-slider__bottom"
      :value="value"
      :options="bottomOptions"
      @change="$emit('change', $event)"
    >
      <template #dot>
        <slider-knob-icon />
      </template>
    </slider>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import Slider from '@/components/Common/Slider/V1/Slider.vue'

import SliderKnobIcon from './assets/slider-knob.svg?inline'

type Options = {
  data: string[] | number[]
  bottomMarks: {
    [k in string | number]: string | number
  },
  topMarks: {
    [k in string | number]: string | number
  },
}

/**
 * Renders a slider with top and bottom labels.
 *
 * A trick is used to achieve this, where two <slider> components are rendered.
 * Their bound value is the same, so they are kept in sync.
 * The top slider has all of the UI hidden, other than the marks.
 */
@Component({ name: 'double-slider', components: { Slider, SliderKnobIcon } })
export default class DoubleSlider extends Vue {
  @Prop({ required: true, type: [String, Number] })
  value!: string | number

  @Prop({ required: true, type: Object })
  options!: Options

  get bottomOptions () {
    return {
      adsorb: true,
      data: this.options.data,
      dotOptions: { tooltip: 'none' },
      marks: this.options.bottomMarks,
      process: (dotsPos: number[]) => [[dotsPos[0], dotsPos[0]]]
    }
  }

  get topOptions () {
    return {
      adsorb: true,
      data: this.options.data,
      dotOptions: { tooltip: 'none' },
      marks: this.options.topMarks,
      process: (dotsPos: number[]) => [[dotsPos[0], dotsPos[0]]]
    }
  }
}
</script>

<!-- Style here is mainly affecting an external component, so needs to be unscoped -->
<style lang="scss" scoped>
.double-slider {
  width: 100%;
  padding: 10px 40px 35px 40px;
}

.double-slider__bottom {
  :deep(.vue-slider-mark-step) {
    margin-top: -3px;
    margin-left: 3px;
    width: 7px;
    height: 20px;
    border-radius: 100px;
    background: $colorSecondaryLight;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
  }

  :deep(.vue-slider-mark-step-active) {
    box-shadow: none;
    opacity: 0;
  }

  :deep(.vue-slider-mark-label) {
    @include typography(sm, default);
    text-transform: uppercase;
    background: $colorSecondaryLight;
    border-radius: 100px;
    color: $colorWhite;
    padding: 3px 10px;
    margin-top: 25px;

    transition: background .2s ease;

    &:hover {
      background: $colorAssignedBlue;
      cursor: pointer;
    }
  }

  :deep(.vue-slider-mark-label-active) {
    background: $colorAssignedBlue;
  }

  :deep(.vue-slider-dot) {
    border-radius: 50%;

    svg circle {
      fill: $colorFeatherFadeLight;
      stroke: $colorFeatherLight;

      transition: all .2s ease;
      transition-property: fill, stroke;
    }

    svg rect {
      fill: $colorFeatherLight;
      transition: fill .2s ease;
    }

    border: none;

    transition: all .2s ease;
    transition-property: box-shadow, background, cursor;

    .vue-slider-dot-handle {
      display: none;
    }

    &:focus {
      outline: 0;
    }

    &:hover {
      svg circle {
        fill: $colorFeatherLight;
        stroke: $colorFeatherFadeLight;
      }

      svg rect {
        fill: $colorFeatherFadeLight;
      }
    }
  }
}

.double-slider__top {
  :deep(.vue-slider-rail) {
    background: none !important;
  }

  :deep(.vue-slider-mark) {
    margin-top: -30px;
  }

  :deep(.vue-slider-mark-label) {
    @include typography(md, default);
    color: $colorBlack;
    text-transform: capitalize;
    background: $colorSecondaryLight3;
    border-radius: 5px;
    padding: 5px 10px;

    transition: all .2s ease;
    transition-property: box-shadow, background;

    &:hover {
      background: $colorPrimaryLight2;
      box-shadow: 0px 2.5px 5px -2.5px rgba(145, 169, 192, 0.3), 0px 0px 5px 0px rgba(145, 169, 192, 0.3);
      cursor: pointer;
    }
  }

  :deep(.vue-slider-mark-label-active) {
    background: $colorPrimaryLight2;
  }

  :deep(.vue-slider-process),
  :deep(.vue-slider-dot),
  :deep(.vue-slider-mark-step) {
    display: none;
  }
}

</style>
