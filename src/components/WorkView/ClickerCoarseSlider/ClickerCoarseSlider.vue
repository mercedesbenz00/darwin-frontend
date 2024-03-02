<template>
  <div class="clicker-coarse-selector">
    <div class="clicker-coarse-selector__marks">
      <span>Fine</span>
      <span>Coarse</span>
    </div>
    <div class="clicker-coarse-selector__wrapper">
      <vue-slider
        v-model="value"
        class="clicker-coarse-selector__wrapper__slider"
        v-bind="sliderOptions"
      >
        <template #dot="{ value: dotValue }">
          <div class="clicker-coarse-selector__wrapper__slider__dot">
            <knob-icon class="clicker-coarse-selector__wrapper__slider__dot__knob" />
            <span>{{ 5.5 - dotValue }}</span>
          </div>
        </template>
      </vue-slider>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed
} from 'vue'
import vueSlider from 'vue-slider-component'

import { useStore, useTheme } from '@/composables'

import 'vue-slider-component/theme/default.css'

import KnobIcon from './assets/knob.svg?inline'

export default defineComponent({
  name: 'ClickerCoarseSlider',
  components: { KnobIcon, vueSlider },
  setup () {
    const { commit, state } = useStore()
    const theme = useTheme()

    const value = computed({
      get: () => state.workview.clickerEpsilon,
      set: (val) => commit('workview/SET_CLICKER_EPSILON', val)
    })

    const sliderOptions = computed(() => {
      return {
        eventType: 'auto',
        width: '100%',
        height: 5,
        min: 0.5,
        max: 4.5,
        step: 1,
        absorb: true,
        dotSize: 20,
        dotStyle: {},
        processStyle: {
          background: 'transparent',
          padding: '10px'
        },
        railStyle: {
          background: theme.getColor('colorAliceShadow'),
          backgroundPosition: 'center'
        },
        show: true,
        speed: 1,
        tooltip: 'none',
        tooltipPlacement: 'top',
        tooltipStyle: {}
      }
    })

    return {
      value,
      sliderOptions
    }
  }
})
</script>

<style lang="scss" scoped>
.clicker-coarse-selector {
  @include col;
  align-items: center;
  min-width: 60px;
  max-width: 90px;
  margin-top: 4px;
  margin-left: 8px;

  &__marks {
    @include row--distributed--center;
    width: 100%;
    @include typography(sm, default, bold);
    color: $colorAliceNight;
  }

  &__wrapper {
    width: 100%;
    padding: 0 10px;

    &__slider {
      &__dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        position: relative;

        span {
          position: absolute;
          @include fullsize;
          @include row--center;
          @include typography(sm, default, bold);
          color: white;
          background: transparent;
        }

        &:hover, &:active {
          box-shadow: 0px 5px 5px rgba(145, 169, 192, 0.3);
        }

        &__knob {
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}
</style>
