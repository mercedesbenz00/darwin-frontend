<template>
  <div
    class="video-annotations-ui-control"
    @mousewheel.stop="onMouseWheel"
  >
    <narrow-icon />
    <vue-slider
      v-model="value"
      class="video-annotations-ui-control__slider"
      v-bind="sliderOptions"
    >
      <template #dot>
        <div class="video-annotations-ui-control__slider__dot">
          <knob-icon
            v-tooltip="tooltip"
            class="video-annotations-ui-control__slider__dot__knob"
          />
        </div>
      </template>
    </vue-slider>
    <wide-icon />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import VueSlider from 'vue-slider-component'

import { KnobIcon } from '@/assets/icons/V1'
import {
  MAX_FRAME_LINE_WIDTH,
  MIN_FRAME_LINE_WIDTH
} from '@/components/WorkView/VideoScrubber/consts'
import { useStore, useTheme } from '@/composables'
import { TooltipOptions } from '@/types'

import NarrowIcon from './assets/narrow.svg?inline'
import WideIcon from './assets/wide.svg?inline'

export default defineComponent({
  name: 'VideoAnnotationsUiControl',
  components: { KnobIcon, NarrowIcon, VueSlider, WideIcon },
  setup () {
    const { commit, state } = useStore()
    const theme = useTheme()

    const frameLineWidth = computed(() => state.ui.workviewVideoFrameLineWidth)
    
    const sliderOptions = computed(() => {
      return {
        eventType: 'auto',
        height: 3,
        dotSize: 20 * theme.getCurrentScale(),
        min: MIN_FRAME_LINE_WIDTH,
        max: MAX_FRAME_LINE_WIDTH,
        interval: 1,
        show: true,
        speed: 1,
        tooltip: 'none',
        tooltipPlacement: 'top',
        railStyle: {
          background: 'url("/static/imgs/slider-track/alice-shadow-shadow.svg")',
          backgroundSize: 'cover'
        },
        dotStyle: {},
        processStyle: {
          background: 'transparent'
        },
        tooltipStyle: {}
      }
    })

    const value = computed({
      get: () => frameLineWidth.value,
      set: (val: number) => commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', val)
    })

    const tooltip = computed((): TooltipOptions | undefined => {
      return {
        placement: 'top',
        classes: 'tooltip--video-annotation-ui-control',
        content: `Frame size: ${value.value}`,
        delay: {
          show: 300,
          hide: 300
        }
      }
    })

    const onMouseWheel = (event: WheelEvent): void => {
      const newWidth = frameLineWidth.value + (event.deltaY < 0 ? 1 : -1)
      if (frameLineWidth.value === newWidth ||
        newWidth < MIN_FRAME_LINE_WIDTH ||
        newWidth > MAX_FRAME_LINE_WIDTH
      ) { return }
      commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', newWidth)
    }

    return {
      frameLineWidth,
      sliderOptions,
      value,
      tooltip,
      onMouseWheel
    }
  }
})
</script>

<style lang="scss" scoped>
.video-annotations-ui-control {
  @include row--center;
  width: 160px;
  padding: 4px 10px;
  background: $colorAliceShadow;

  &__slider {
    flex: 1 1 auto;
    margin: 0 14px;

    &__dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;

      &:hover, &:active {
        box-shadow: 0px 5px 5px rgba(145, 169, 192, 0.3);
      }

      &__knob {
        width: 100%;
        height: 100%;

        &:focus,
        &:active {
          outline: none !important;
          stroke: none !important;
        }
      }
    }
  }
}
</style>
