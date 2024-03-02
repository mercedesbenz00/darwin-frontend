<template>
  <image-manipulator
    class="window-level"
    @refresh="refresh"
  >
    <template #label>
      <span>Window Levels</span>
      <info
        class="image-manipulation__item__info"
      >
        Define the tonal or Hounsfield range of an image, and its midpoint.
      </info>
    </template>
    <template #others>
      <canvas
        ref="histogramCanvas"
        class="window-level__histogram-canvas"
        :width="histogramWidth"
        :height="histogramHeight"
      />
      <div class="window-level__hotkey-info">
        <label>
          W:
          <strong>TAB</strong>
          <span>+</span>
          <strong>↔</strong>
        </label>
        <label>
          L:
          <strong>TAB</strong>
          <span>+</span>
          <strong>↕</strong>
        </label>
        <info class="window-level__hotkey__info">
          Hold the TAB key and move your mouse UP or DOWN over the image to
          adjust window level (center) or LEFT and RIGHT to adjust the width.
        </info>
      </div>
    </template>
    <template #slider>
      <manipulator-double-slider
        v-model="windowLevels"
        :min="windowLevelsRange[0]"
        :max="windowLevelsRange[1]"
      />
    </template>
  </image-manipulator>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  computed
} from 'vue'

import Info from '@/components/Common/Info.vue'
import { useTheme } from '@/composables'
import { useActiveView, useCurrentFrameIndex } from '@/composables/useEditorV2'
import { useImageManipulationFilter } from '@/composables/useEditorV2/useImageFilter'
import { WindowLevels } from '@/engineCommon/imageManipulation'
import { resolveRawImageData } from '@/engineV2/utils'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorDoubleSlider from './components/ManipulatorDoubleSlider.vue'

export default defineComponent({
  name: 'WindowLevelManipulator',
  components: { ImageManipulator, ManipulatorDoubleSlider, Info },
  props: {
    /**
     * Determines if the component should automatically recompute the histogram
     * if image data changes.
     *
     * Auto-recomputation will be triggered when
     * - the prop itself changes from false to true
     * - the image data on the editor changes and prop is currently true
     *
     * A typical use-net for this is if the component is in a not-always-visible UI element,
     * At the time of implementation, this UI element was the image manipulation sidebar in the
     * workview.
     */
    autoRecompute: { required: false, type: Boolean, default: false }
  },
  setup (props) {
    const theme = useTheme()
    const hasStackedImageChange = ref(false)
    const histogramCanvas = ref<HTMLCanvasElement>()
    const activeView = useActiveView()
    const { imageFilter, updateFilter } = useImageManipulationFilter()

    const currentFrameIndex = useCurrentFrameIndex(activeView)

    const windowLevelsRange = ref<WindowLevels>(activeView.value.windowLevelsRange)

    const windowLevels = computed({
      get (): WindowLevels {
        return [
          Math.max(imageFilter.value.windowLevels[0], windowLevelsRange.value[0]),
          Math.min(imageFilter.value.windowLevels[1], windowLevelsRange.value[1])
        ]
      },
      set (val: WindowLevels): void {
        updateFilter({
          windowLevels: val
        })
      }
    })

    const histogramWidth = computed((): number => 240 * theme.getCurrentScale())
    const histogramHeight = computed((): number => 150 * theme.getCurrentScale())

    const refresh = (): void => {
      updateFilter({
        windowLevels: activeView.value.defaultWindowLevels
      })
    }

    const reloadHistogram = async (): Promise<void> => {
      if (!histogramCanvas.value) { return }
      if (!hasStackedImageChange.value) { return }

      let frame

      try {
        // Sometimes we have no LQ image
        frame = await activeView.value.fileManager
          .getLQFrame(activeView.value.currentFrameIndex, { fallbackHQFrame: true })
      } catch {
        frame = await activeView.value.fileManager
          .getHQFrame(activeView.value.currentFrameIndex)
      }

      if (!frame) { return }

      hasStackedImageChange.value = false
      activeView.value.renderManager.renderHistogram(
        histogramCanvas.value,
        resolveRawImageData(frame)
      )
    }

    watch(() => props.autoRecompute, (autoRecompute) => {
      if (!autoRecompute) { return }
      reloadHistogram()
    }, { immediate: true })

    const handleHistogramRender = () => {
      hasStackedImageChange.value = true
      if (!props.autoRecompute) { return }
      reloadHistogram()
    }

    watch(() => currentFrameIndex.value, handleHistogramRender)

    watch(() => activeView.value, () => {
      handleHistogramRender()
      windowLevelsRange.value = activeView.value.windowLevelsRange
    }, { immediate: true })

    return {
      histogramCanvas,
      windowLevelsRange,
      windowLevels,
      histogramWidth,
      histogramHeight,
      refresh
    }
  }
})
</script>

<style lang="scss" scoped>
.window-level {
  @include col;
  align-items: center;
  padding-bottom: 20px;
}

.window-level__hotkey-info {
  width: 100%;
  @include row;
  align-items: center;
  @include typography(md-1, default);
  color: $color90Black;
  margin: 10px 0;

  & > label {
    margin-right: 7px;

    span {
      color: $colorAliceNight;
    }

    strong {
      @include typography(md, default, bold);
      background: $colorAliceShadow;
      border-radius: 3px;
      margin: 0 3px;
      padding: 2px 3px;
      color: $color90Black;
    }
  }
}

.window-level__hotkey__info {
  margin-left: 5px;
}

.window-level__histogram-canvas {
  width: 240px;
  height: 150px;
  margin-top: 10px;
}
</style>
