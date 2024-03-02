<template>
  <!--
    note that props x and w are not set here. Instead, we rely on a watcher
    to position the element manually.
  -->
  <vue-draggable-resizable
    ref="draggableRef"
    class="video-comment-thread-indicator__draggable"
    parent
    axis="x"
    :grid="grid"
    :min-width="16 * $theme.getCurrentScale()"
    :draggable="false"
    :resizable="false"
    :y="y"
    :h="height"
  >
    <div
      class="video-comment-thread-indicator"
      @click.stop.prevent="onClick"
    >
      <comment-indicator-icon class="video-comment-thread-indicator__icon" />
      <label class="video-comment-thread-indicator__label">{{ count }}</label>
    </div>
  </vue-draggable-resizable>
</template>

<script lang="ts">
import VueDraggableResizable from 'vue-draggable-resizable'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Editor } from '@/engine/editor'
import { RootState } from '@/store/types'

import CommentIndicatorIcon from './assets/comment-indicator.svg?inline'
import {
  ANNOTATION_ITEM_HEIGHT,
  ANNOTATION_ITEM_HEIGHT_WITH_BORDER
} from './consts'

@Component({
  name: 'video-comment-thread-indicator',
  components: { CommentIndicatorIcon, VueDraggableResizable }
})
export default class VideoCommentThreadIndicator extends Vue {
  @Prop({ required: true })
  frameIndex!: number

  @Prop({ required: true })
  count!: number

  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: true })
  yIndex!: number

  @State((state: RootState) => state.ui.workviewVideoFrameLineWidth)
  frameLineWidth!: number

  readonly height: number = ANNOTATION_ITEM_HEIGHT

  $refs!: Vue['$refs'] & {
    draggableRef?: {
      changeWidth: (w: number) => void
      checkParentSize: () => void
      moveHorizontally: (x: number) => void
    }
  }

  readonly itemHeightWithBorder: number = ANNOTATION_ITEM_HEIGHT_WITH_BORDER

  /**
   * Dimensions of the draggable/resizable grid as [x, y]
   */
  get grid () {
    return [this.frameLineWidth, this.itemHeightWithBorder]
  }

  get startIndex () { return this.frameIndex }
  get endIndex () { return this.frameIndex }

  /** Top edge of item */
  get y (): number {
    return this.itemHeightWithBorder * this.yIndex
  }

  /** Left edge of item */
  get x (): number {
    const { frameLineWidth, startIndex } = this
    return startIndex * frameLineWidth
  }

  mounted () {
    this.reposition()
  }

  onClick () {
    this.editor.jumpToFrame(this.frameIndex)
  }

  /**
   * The parent size is dynamically set and relies on the same basic prop.
   *
   * Due to order of computation for various watchers across multiple components,
   * we cannot rely on props for `vue-draggable-observable`.
   *
   * Instead, we call functions on the component itself, to set the UI manually.
   * This is using unofficial features and is prone to breaking, so we should
   * monitor and aim to move away from it.
   */
  @Watch('frameLineWidth')
  onFrameLineWidth () { this.reposition() }

  @Watch('x')
  onPosition () { this.reposition() }

  reposition (): void {
    // $nextTick because VideoAnnotations.vue needs to resize before we can move
    // this item safely.
    this.$nextTick(() => {
      const { frameLineWidth, x } = this
      const { draggableRef } = this.$refs
      if (!draggableRef) { return }
      draggableRef.checkParentSize()
      draggableRef.moveHorizontally(x)
      draggableRef.changeWidth(frameLineWidth)
    })
  }
}
</script>

<style lang="scss" scoped>
.video-comment-thread-indicator__draggable {
  position: absolute;
  top: 0;
  left: 0;
  max-height: 21px;
  border: none;
  cursor: pointer;
  z-index: 1 !important; // Keeps comment indicator above annotations by default
}

.video-comment-thread-indicator {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  user-select: none;
}

.video-comment-thread-indicator__icon {
  width: 15px;
  height: 19px;
  cursor: pointer;
}

.video-comment-thread-indicator__label {
  position: absolute;
  @include typography(xs, mulish, bold);
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  color: $colorWhite;
  @include noSelect;
  cursor: pointer;
}
</style>
