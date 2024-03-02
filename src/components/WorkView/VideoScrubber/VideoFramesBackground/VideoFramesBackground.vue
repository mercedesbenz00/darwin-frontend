<template>
  <canvas
    v-if="currentLoadedVideo"
    ref="canvas"
    class="video-frames-background"
    :width="width"
    :height="height"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { Editor } from '@/engine/editor'
import { View } from '@/engine/models'
import { OriginBasedFrameIndex } from '@/engine/models/views/types'
import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { LoadedFrame, LoadedVideo } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

import { VideoFramesBackgroundEngine } from './VideoFramesBackgroundEngine'

/**
 * Renders vertical lines to indicate each frame in the frames timeline
 * - if the hq or lq frame is loaded, renders the dark frame line
 * - else, renders the light frame line with the engine
 */
@Component({
  name: 'video-frames-background'
})
export default class VideoAnnotations extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: true, type: Number })
  height!: number

  @Getter('currentLoadedVideo', { namespace: 'workview' })
  currentLoadedVideo!: LoadedVideo | null

  @State((state: RootState) => state.ui.workviewVideoFrameLineWidth)
  frameLineWidth!: number

  $refs!: {
    canvas: HTMLCanvasElement
  }

  engine: VideoFramesBackgroundEngine = new VideoFramesBackgroundEngine()

  handler: CallbackHandle | null = null

  /**
   * Number of frames in the current loaded video
   */
  get frameCount (): number {
    return this.editor.activeView.totalFrames
  }

  /**
   * Width of the canvas
   */
  get width (): number {
    return this.frameCount * this.frameLineWidth
  }

  /**
   * Frames of the active view
   */
  get frames (): { [frameIndex: number]: LoadedFrame } {
    const { activeView } = this.editor
    if (activeView.zeroBasedFrames && Object.values(activeView.zeroBasedFrames).length) {
      return activeView.zeroBasedFrames
    }
    const { currentLoadedVideo } = this
    if (currentLoadedVideo) { return currentLoadedVideo.frames }
    return {}
  }

  mounted (): void {
    this.setCanvas()
  }

  @Watch('editor.activeView', { immediate: true })
  onActiveView (view: View): void {
    this.handler?.release()

    this.handler = view.onFrameLoaded((frameIndex: OriginBasedFrameIndex) => {
      // frameIndex isWatch origin-based.
      // Need to convert to zero-based to use inside engine.
      this.engine.markFrameAsLoaded(view.toZeroBasedIndex(frameIndex))
    })
    this.$once('hook:beforeDestroy', () => {
      this.handler?.release()
    })
  }

  @Watch('framesCount', { immediate: true })
  onFramesCount (count: number): void {
    if (this.engine.framesCount !== count) {
      this.engine.setFramesCount(count)
    }
  }

  /**
   * Set canvas element to the engine
   */
  setCanvas (): void {
    this.engine.setCanvas(this.$refs.canvas)
    this.setCanvasHeight()
  }

  @Watch('frames', { immediate: true })
  onFrames (frames: { [frameIndex: number]: LoadedFrame }): void {
    this.engine.setFrames(frames)
  }

  @Watch('frameLineWidth', { immediate: true })
  onFrameLineWidth (): void {
    this.engine.setFrameLineWidth(this.frameLineWidth)
  }

  @Watch('height', { immediate: true })
  onHeight (): void {
    this.setCanvasHeight()
  }

  /**
   * Canvas height should be set as maximum of height by prop and timeline height
   */
  setCanvasHeight (): void {
    const height = this.$refs.canvas
      ? Math.max(this.height, this.$refs.canvas.clientHeight)
      : this.height
    this.engine.setHeight(height)
  }
}
</script>

<style lang="scss" scoped>
.video-frames-background {
  height: 100%;
  background: $colorAliceBlue;
}
</style>
