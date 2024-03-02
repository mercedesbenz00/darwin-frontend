<template>
  <div
    class="video-frames-background"
  >
    <div
      v-if="showRuler"
      class="video-frames-background__ruler"
    >
      <div
        v-for="{ frame, showFrame, size } in framesArray"
        :key="`frame-${frame}`"
        :style="{ 'width': `${frameLineWidth}px` }"
        class="video-frames-background__ruler__item"
        :class="`video-frames-background__ruler__item--${size}`"
      >
        {{ showFrame ? frame : '' }}
      </div>
    </div>
    <canvas
      ref="canvas"
      class="video-frames-background__canvas"
      :class="{ 'video-frames-background__canvas--with-ruler': showRuler }"
      :width="width"
      :height="height"
    />
    <slot />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  watch,
  onBeforeUnmount
} from 'vue'

import { useStore } from '@/composables'
import { useActiveView } from '@/composables/useEditorV2'

import { VideoFramesBackgroundEngine } from './VideoFramesBackgroundEngine'

/**
 * Renders vertical lines to indicate each frame in the frames timeline
 * - if the hq or lq frame is loaded, renders the dark frame line
 * - else, renders the light frame line with the engine
 */
export default defineComponent({
  name: 'VideoFramesBackground',
  props: {
    height: { required: true, type: Number },
    framesCount: { required: true, type: Number },
    showRuler: { default: false, type: Boolean }
  },
  setup (props) {
    const { state } = useStore()

    const activeView = useActiveView()

    const frameLineWidth = computed(() => state.ui.workviewVideoFrameLineWidth)

    const engine: VideoFramesBackgroundEngine = new VideoFramesBackgroundEngine()

    const canvas = ref<HTMLCanvasElement>()

    /**
     * Width of the canvas
     */
    const width = computed(() => props.framesCount * frameLineWidth.value)

    /**
     * Create an array for the ruler component
     */
    const framesArray = computed(() => {
      return [ ...Array(props.framesCount).keys() ]
        .map((frame: number) => {
          const big = frame % 10 === 0
          const medium = !big && frame % 5 === 0
          return {
            frame: frame + 1,
            showFrame: !!big || !!medium,
            size: big ? 'big' : (medium ? 'medium' : '')
          }
        })
    })

    /**
     * Canvas height should be set as maximum of height by prop and timeline height
     */
    const setCanvasHeight = (): void => {
      const height = canvas.value
        ? Math.max(props.height, canvas.value.clientHeight)
        : props.height
      engine.setHeight(height)
    }

    /**
     * Set canvas element to the engine
     */
    const setCanvas = (): void => {
      if (!canvas.value) { return }
      engine.setCanvas(canvas.value)
      setCanvasHeight()
    }
  
    const handleFrameLoaded = (index: number): void => {
      engine.markFrameAsLoaded(index)
    }

    watch(() => activeView.value, (newView, oldView) => {
      oldView?.fileManager.off('frame:loaded', handleFrameLoaded)
      newView.fileManager.on('frame:loaded', handleFrameLoaded)
    }, { immediate: true })

    onMounted(() => {
      activeView.value.fileManager.on('frame:loaded', handleFrameLoaded)
      setCanvas()
    })

    onBeforeUnmount(() => {
      activeView.value.fileManager.off('frame:loaded', handleFrameLoaded)
    })

    watch(
      () => props.framesCount,
      (count: number): void => {
        if (engine.framesCount !== count) {
          engine.setFramesCount(count)
        }
      },
      { immediate: true })

    watch(
      frameLineWidth,
      (): void => {
        engine.setFrameLineWidth(frameLineWidth.value)
      },
      { immediate: true }
    )

    watch(
      () => props.height,
      (): void => {
        setCanvasHeight()
      },
      { immediate: true }
    )

    return {
      canvas,
      width,
      framesArray,
      frameLineWidth
    }
  }
})
</script>

<style lang="scss" scoped>
$rulerSize: 20px;

.video-frames-background {
  @include col;
  height: 100%;
  width: fit-content;

  &__ruler {
    @include row;
    position: relative;
    height: $rulerSize;
    width: 100%;
    background: $colorAliceShadow;

    &__item {
      position: relative;
      color: $colorContentSecondary;
      text-align: center;
      user-select: none;
      padding-left: 1px;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 0;
        width: 1px;
        background: $colorContentSecondary;
      }

      &--big {
        @include typography(sm, inter, 500);

        &::after {
          height: $rulerSize;
        }
      }
      
      &--medium {
        @include typography(xs, inter, 500);

        &::after {
          height: $rulerSize / 3;
        }
      }
    }
  }

  &__canvas {
    height: 100%;
    width: 100%;
    top: 0;
    background: $colorAliceBlue;

    &--with-ruler{
      top: $rulerSize;
      height: calc(100% - #{$rulerSize});
    }
  }
}
</style>
