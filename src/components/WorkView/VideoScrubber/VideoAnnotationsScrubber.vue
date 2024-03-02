<template>
  <vue-draggable-resizable
    ref="draggableRef"
    class="video-scrubber__draggable"
    :style="style"
    axis="x"
    drag-handle=".video-scrubber__handle"
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
      class="video-scrubber"
      @contextmenu.stop.prevent="$emit('show-context-menu', $event)"
    >
      <scrubber-icon
        class="video-scrubber__handle"
        :style="iconStyle"
      />
      <div class="video-scrubber__line" />
    </div>
  </vue-draggable-resizable>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import VueDraggableResizable from 'vue-draggable-resizable'
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Editor } from '@/engine/editor'

import ScrubberIcon from './assets/scrubber.svg?inline'

@Component({
  name: 'video-annotations-scrubber',
  components: { ScrubberIcon, VueDraggableResizable }
})
export default class VideoAnnotationsScrubber extends Vue {
  @Prop({ required: true, type: Object as () => Editor })
  editor!: Editor

  @Prop({ required: true, default: 0 })
  currentFrameIndex!: number

  @Prop({ required: true, type: String })
  scrollerSelector!: string

  @State(state => state.ui.workviewVideoFrameLineWidth)
  frameLineWidth!: number

  y: number = 0

  $refs!: {
    draggableRef: typeof VueDraggableResizable
  }

  get x (): number {
    return this.currentFrameIndex * this.frameLineWidth
  }

  get iconWidth (): number {
    return this.frameLineWidth * 2 + 1
  }

  /**
   * Computed style to apply to the root element to center the scrubber in the frame
   */
  get style (): Partial<{ [key in keyof CSSStyleDeclaration]: string }> {
    return { width: `${this.frameLineWidth - 1}px` }
  }

  /**
   * Computed style to apply to the icon to center the scrubber in the frame
   */
  get iconStyle (): Partial<{ [key in keyof CSSStyleDeclaration]: string }> {
    return { width: `${this.frameLineWidth * 4 - 1}px` }
  }

  @Watch('editor.activeView')
  onActiveViewChange (): void {
    this.$refs.draggableRef.checkParentSize()
    this.$refs.draggableRef.updateBounds()
  }

  @Watch('frameLineWidth')
  onFrameLineWidthChange (newWidth: number, oldWidth: number): void {
    this.centerCurrentFrame(newWidth, oldWidth)
    this.$nextTick(() => {
      const { draggableRef } = this.$refs
      if (!draggableRef) { return }
      draggableRef.checkParentSize()
      draggableRef.updateBounds()
      draggableRef.moveHorizontally(this.x)
    })
  }

  centerCurrentFrame (newWidth: number, oldWidth: number): void {
    const scrollerElem = document.querySelector(this.scrollerSelector)
    if (!scrollerElem) { return }
    const { currentFrameIndex } = this
    const oldLeft = scrollerElem.scrollLeft
    const offset = currentFrameIndex * oldWidth - oldLeft
    const newLeft = currentFrameIndex * newWidth - offset
    scrollerElem.scrollLeft = newLeft
  }

  onDrag (x: number): void {
    const frameIndex = Math.ceil(x / this.frameLineWidth)
    this.emitFrameIndex(frameIndex)
  }

  emitFrameIndex (index: number): void {
    this.$emit('frame-index-changed', index)
  }

  debouncedEmitFrameIndex = debounce(this.emitFrameIndex, 0, { leading: false, trailing: true })

  @Ref('scrubberRef')
  scrubberRef?: HTMLDivElement

  /**
   * When current frame index changes, need to watch if the scrubber is visible or not.
   * Get the scroller's left/right client scrolled position and calculate the visible
   * frame index range.
   * If the current frame index is inside that range, keep it as is.
   * If not, scroll to the scrubber to make it visible.
   */
  @Watch('currentFrameIndex')
  onCurrentFrameIndexChange (): void {
    const scrollerElem = document.querySelector(this.scrollerSelector)
    if (!scrollerElem) { return }
    const left = scrollerElem.scrollLeft
    const right = scrollerElem.scrollLeft + scrollerElem.clientWidth
    const visibleLeftIndex = Math.ceil(left / this.frameLineWidth)
    const visibleRightIndex = Math.floor(right / this.frameLineWidth)
    const { currentFrameIndex } = this

    if (visibleLeftIndex <= currentFrameIndex && currentFrameIndex <= visibleRightIndex) {
      return
    }

    this.$nextTick(() => {
      const { scrubberRef } = this
      if (!scrubberRef) { return }
      scrubberRef.scrollIntoView()
    })
  }
}
</script>

<style lang="scss" scoped>
.video-scrubber__draggable {
  position: absolute;
  margin-left: 5px;
  top: 0;
  bottom: 0;
  height: 100% !important;
  border: none;
  z-index: 11 !important;
}

.video-scrubber {
  @include col--center;
  user-select: none;
  height: 100%;
}

.video-scrubber__handle {
  height: 25px;
  cursor: pointer;
  position: sticky;
  top: 0;
}

.video-scrubber__line {
  flex: 1;
  width: 1px;
  margin-top: -5px;
  background: $colorCrimsonLight;
}
</style>
