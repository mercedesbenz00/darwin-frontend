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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import Info from '@/components/Common/Info.vue'
import { Editor } from '@/engine/editor'
import { WindowLevels } from '@/engineCommon/imageManipulation'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorDoubleSlider from './components/ManipulatorDoubleSlider.vue'

@Component({
  name: 'window-level-manipulator',
  components: { ImageManipulator, ManipulatorDoubleSlider, Info }
})
export default class WindowLevelManipulator extends Vue {
  @Prop({ required: true })
  editor!: Editor

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
  @Prop({ required: false, type: Boolean, default: false })
  autoRecompute!: boolean

  hasStackedImageChange: boolean = false

  get windowLevels (): [number, number] {
    return [
      Math.max(this.editor.activeView.imageFilter.windowLevels[0], this.windowLevelsRange[0]),
      Math.min(this.editor.activeView.imageFilter.windowLevels[1], this.windowLevelsRange[1])
    ]
  }

  set windowLevels (val: WindowLevels) {
    this.editor.activeView.setImageFilter({
      ...this.editor.activeView.imageFilter,
      windowLevels: val
    })
  }

  get windowLevelsRange (): WindowLevels {
    const { windowLevelsRange } = this.editor.activeView
    return windowLevelsRange
  }

  $refs!: {
    histogramCanvas: HTMLCanvasElement
  }

  @Watch('editor.activeView.currentFrameIndex', { immediate: true })
  onCurrentFrameIndexChange (): void {
    this.hasStackedImageChange = true
    if (!this.autoRecompute) { return }
    this.reloadHistogram()
  }

  @Watch('autoRecompute')
  onSidebarOpen () {
    if (!this.autoRecompute) { return }
    this.reloadHistogram()
  }

  get histogramWidth () {
    return 240 * this.$theme.getCurrentScale()
  }

  get histogramHeight () {
    return 150 * this.$theme.getCurrentScale()
  }

  refresh () {
    this.editor.activeView.setImageFilter({
      ...this.editor.activeView.imageFilter,
      windowLevels: this.editor.activeView.defaultWindowLevels
    })
  }

  reloadHistogram () {
    const { histogramCanvas } = this.$refs
    if (!histogramCanvas) { return }
    if (!this.hasStackedImageChange) { return }

    this.hasStackedImageChange = false
    this.editor.activeView.renderHistogram(histogramCanvas)
  }
}
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
