<template>
  <vue-draggable-resizable
    ref="draggableRef"
    id="VideoAnnotationScrubber"
    class="video-annotation-scrubber"
    :style="style"
    axis="x"
    drag-handle=".video-annotation-scrubber__wrapper__handle"
    parent
    :grid="[frameLineWidth, 1]"
    :resizable="false"
    :x="x"
    :y="y"
    w="auto"
    h="auto"
    @dragging="onDrag"
  >
    <div
      ref="scrubberRef"
      class="video-annotation-scrubber__wrapper"
      @contextmenu.stop.prevent="$emit('show-context-menu', $event)"
    >
      <scrubber-icon
        class="video-annotation-scrubber__wrapper__handle"
        :style="iconStyle"
      />
      <div class="video-annotation-scrubber__wrapper__line" />
    </div>
  </vue-draggable-resizable>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import {
  computed,
  defineComponent,
  nextTick,
  Ref,
  ref,
  SetupContext,
  watch
} from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'

import ScrubberIcon from '@/components/WorkView/VideoScrubber/assets/scrubber.svg?inline'
import { useStore } from '@/composables'
import { Editor } from '@/engineV2/editor'

export default defineComponent({
  name: 'VideoAnnotationsScrubber',
  components: { ScrubberIcon, VueDraggableResizable },
  props: {
    editor: { required: true, type: Object as () => Editor },
    currentFrameIndex: { default: 0, required: true, type: Number }, 
    framesCount: { default: 0, required: true, type: Number }, 
    scrollerSelector: { required: true, type: String }
  },
  setup (props, { emit }: SetupContext) {
    const { state } = useStore()

    const draggableRef = ref<typeof VueDraggableResizable>()
    const scrubberRef = ref<HTMLDivElement>()

    const y: Ref<number> = ref(0)

    const frameLineWidth = computed((): number => {
      return state.ui.workviewVideoFrameLineWidth
    })

    const x = computed((): number => {
      return props.currentFrameIndex * frameLineWidth.value
    })

    /**
     * Computed style to apply to the root element to center the scrubber in the frame
     */
    const style = computed((): Partial<{ [key in keyof CSSStyleDeclaration]: string }> => {
      return { width: `${frameLineWidth.value - 1}px` }
    })

    /**
     * Computed style to apply to the icon to center the scrubber in the frame
     */
    const iconStyle = computed((): Partial<{ [key in keyof CSSStyleDeclaration]: string }> => {
      return { width: `${frameLineWidth.value * 4 - 1}px` }
    })

    const centerCurrentFrame = (newWidth: number, oldWidth: number): void => {
      const scrollerElem = document.querySelector(props.scrollerSelector)
      if (!scrollerElem) { return }
      const oldLeft = scrollerElem.scrollLeft
      const offset = props.currentFrameIndex * oldWidth - oldLeft
      const newLeft = props.currentFrameIndex * newWidth - offset
      scrollerElem.scrollLeft = newLeft
    }

    const emitFrameIndex = (index: number): void => {
      emit('frame-index-changed', index)
    }

    const debouncedEmitFrameIndex = debounce(
      emitFrameIndex, 10, { leading: false, trailing: true }
    )

    const onDrag = (x: number): boolean => {
      const frameIndex = Math.ceil(x / frameLineWidth.value)
      if (frameIndex > props.framesCount) { return false }
      emitFrameIndex(frameIndex)
      return true
    }
    
    watch(() => props.editor.activeView, () => {
      if (!draggableRef.value) { return }
      draggableRef.value.checkParentSize()
      draggableRef.value.updateBounds()
    })

    watch(() => frameLineWidth.value, (newVal: number, oldVal: number) => {
      centerCurrentFrame(newVal, oldVal)
      nextTick(() => {
        if (!draggableRef.value) { return }
        draggableRef.value.checkParentSize()
        draggableRef.value.updateBounds()
        draggableRef.value.moveHorizontally(x.value)
      })
    })

    /**
     * When current frame index changes, need to watch if the scrubber is visible or not.
     * Get the scroller's left/right client scrolled position and calculate the visible
     * frame index range.
     * If the current frame index is inside that range, keep it as is.
     * If not, scroll to the scrubber to make it visible.
     */
    watch(() => props.currentFrameIndex, (val: number) => {
      const scrollerElem = document.querySelector(props.scrollerSelector)
      if (!scrollerElem) { return }

      const left = scrollerElem.scrollLeft
      const right = scrollerElem.scrollLeft + scrollerElem.clientWidth
      const visibleLeftIndex = Math.ceil(left / frameLineWidth.value)
      const visibleRightIndex = Math.floor(right / frameLineWidth.value)

      if (visibleLeftIndex <= val && val <= visibleRightIndex) { return }

      nextTick(() => {
        if (!scrubberRef.value) { return }
        scrubberRef.value.scrollIntoView()
      })
    })

    return {
      draggableRef,
      scrubberRef,
      y,
      frameLineWidth,
      x,
      iconStyle,
      style,
      centerCurrentFrame,
      onDrag,
      emitFrameIndex,
      debouncedEmitFrameIndex
    }
  }
})
</script>

<style lang="scss" scoped>
.video-annotation-scrubber {
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100% !important;
  border: none;
  z-index: 11 !important;

  &__wrapper {
    @include col--center;
    user-select: none;
    height: 100%;

    &__handle {
      position: relative;
      height: 24px;
      top: 0;
      margin-bottom: -1px;
      cursor: pointer;
    }

    &__line {
      flex: 1;
      width: 1px;
      background: $colorCrimsonLight;
    }
  }
}
</style>
