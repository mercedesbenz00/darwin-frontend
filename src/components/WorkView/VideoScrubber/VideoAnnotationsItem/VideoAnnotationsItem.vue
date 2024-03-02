<template>
  <!--
    note that props x and w are not set here. Instead, we rely on a watcher
    to position the element manually.
  -->
  <vue-draggable-resizable
    ref="draggableRef"
    class="video-annotations-item__draggable"
    parent
    axis="x"
    :grid="grid"
    :handles="['mr', 'ml']"
    :min-width="3"
    :y="y"
    :h="height"
    :active="active"
    @dragstop="onDragged"
    @resizing="onResizing"
    @resizestop="onResized"
    @mouseleave.native="onMouseLeave"
    @mouseover.native="onMouseOver"
  >
    <template #ml>
      <div
        v-tooltip="{
          content: `Frame ${startIndexForTooltip}`,
          delay: { show: 0, hide: 0 },
          trigger: 'manual',
          show: cursorOnLeftHandle
        }"
        class="video-annotations-item__ml"
        @mouseleave="cursorOnLeftHandle = resizing || false"
        @mouseover="cursorOnLeftHandle = true"
      >
        <extender-icon class="video-annotations-item__ml__icon" />
      </div>
    </template>
    <template #mr>
      <div
        v-tooltip="{
          content: `Frame ${endIndexForTooltip}`,
          delay: { show: 0, hide: 0 },
          trigger: 'manual',
          show: cursorOnRightHandle
        }"
        class="video-annotations-item__mr"
        @mouseleave="cursorOnRightHandle = resizing || false"
        @mouseover="cursorOnRightHandle = true"
      >
        <extender-icon class="video-annotations-item__mr__icon" />
      </div>
    </template>

    <video-annotations-item-annotation
      :active="active"
      :annotation="annotation"
      @click="onClick"
      @contextmenu="$emit('contextmenu', $event)"
      @dblclick="onDblClick"
      @delete-key-frame="deleteKeyFrame"
      @select-key-frame="selectKeyFrame"
    />
  </vue-draggable-resizable>
</template>

<script lang="ts">
import VueDraggableResizable from 'vue-draggable-resizable'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import {
  ANNOTATION_ITEM_HEIGHT,
  ANNOTATION_ITEM_HEIGHT_WITH_BORDER
} from '@/components/WorkView/VideoScrubber/consts'
import { changeAnnotationClass } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { Annotation } from '@/engine/models'
import { RootState } from '@/store/types'

import VideoAnnotationsItemAnnotation from './VideoAnnotationsItemAnnotation.vue'
import ExtenderIcon from './assets/extender.svg?inline'

@Component({
  name: 'video-annotations-item',
  components: { ExtenderIcon, VideoAnnotationsItemAnnotation, VueDraggableResizable }
})
export default class VideoAnnotationsItem extends Vue {
  @Prop({ required: true })
  annotation!: Annotation

  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: true })
  yIndex!: number

  @Getter('tabletCompensation', { namespace: 'ui' })
  tabletCompensation!: number

  @State((state: RootState) => state.ui.workviewVideoFrameLineWidth)
  frameLineWidth!: number

  hover: boolean = false
  resizing: boolean = false

  get height (): number {
    return ANNOTATION_ITEM_HEIGHT * this.$theme.getCurrentScale() * this.tabletCompensation
  }

  /**
   * These 2 variables is used to keep the `hover` status of
   * left/right resize handlers.
   *
   * When mouseleave, these will be false unless it is resizing atm.
   * When mouseover, these will be true.
   */
  cursorOnLeftHandle: boolean = false
  cursorOnRightHandle: boolean = false

  $refs!: Vue['$refs'] & {
    draggableRef?: Vue & {
      changeWidth: (w: number) => void
      checkParentSize: () => void
      moveHorizontally: (x: number) => void
    }
  }

  get itemHeightWithBorder (): number {
    return (
      ANNOTATION_ITEM_HEIGHT_WITH_BORDER *
      this.$theme.getCurrentScale() *
      this.tabletCompensation
    )
  }

  /**
   * Dimensions of the draggable/resizable grid as [x, y]
   */
  get grid (): [number, number] {
    return [this.frameLineWidth, this.itemHeightWithBorder]
  }

  /**
   * First frame of item
   */
  get startIndex (): number {
    const { segments } = this.annotation.data
    if (Number.isFinite(segments?.[0]?.[0])) {
      return this.editor.activeView.toZeroBasedIndex(segments[0][0])
    }

    return this.editor.activeView.zeroBasedCurrentFrameIndex
  }

  /**
   * Last frame of item
   */
  get endIndex (): number {
    let index = this.editor.activeView.zeroBasedCurrentFrameIndex

    const { segments } = this.annotation.data
    const lastSegmentIndex = segments.length - 1
    if (Number.isFinite(segments?.[lastSegmentIndex]?.[1])) {
      index = this.editor.activeView.toZeroBasedIndex(segments[lastSegmentIndex][1])
    }

    // For segment end index equal 'null`, last frame index expected as value
    if (segments?.[lastSegmentIndex]?.[1] === null) {
      return this.editor.activeView.lastFrameIndex + 1
    }

    // Ensure min segment length to be 1
    return Math.max(index, this.startIndex + 1)
  }

  /**
   * If annotation is selected/hovered/resizing, true
   * Else, false
   */
  get active (): boolean {
    return this.annotation.isSelected || this.resizing || this.hover
  }

  get isVisible (): boolean {
    return this.annotation.isVisible
  }

  /** Top edge of item */
  get y (): number {
    return this.itemHeightWithBorder * this.yIndex
  }

  /** Left edge of item */
  get x (): number {
    const { frameLineWidth, startIndex } = this
    return startIndex * frameLineWidth
  }

  /** Width of item */
  get width (): number {
    const { endIndex, frameLineWidth, startIndex } = this
    return (endIndex - startIndex) * frameLineWidth
  }

  /** Compouned computed, exists purely so we can create a watcher for it */
  get position (): { width: number, x: number } {
    const { width, x } = this
    return { width, x }
  }

  mounted (): void {
    this.onPosition()
  }

  @Watch('annotation.isSelected', { immediate: true })
  onSelected (): void {
    if (!this.annotation.isSelected) { return }
    const { draggableRef } = this.$refs
    if (!draggableRef) { return }

    this.$nextTick(() => {
      draggableRef.$el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    })
  }

  onMouseLeave (): void {
    if (!this.isVisible) { return }
    this.hover = false
  }

  onMouseOver (): void {
    if (!this.isVisible) { return }
    this.hover = true
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
  @Watch('position')
  onPosition (): void {
    // $nextTick because VideoAnnotations.vue needs to resize before we can move
    // this item safely.
    this.$nextTick(() => {
      const { position: { width, x } } = this
      const { draggableRef } = this.$refs
      if (!draggableRef) { return }
      draggableRef.checkParentSize()
      draggableRef.moveHorizontally(x)
      draggableRef.changeWidth(width)
    })
  }

  /** Holds future start index of the annotation during resize */
  newStartIndex: number | null = null
  /** Holds future end index of the annotation during resize */
  newEndIndex: number | null = null

  /**
   * Handles "resizing" event emitted by vue-draggable-resizable
   *
   * This one is being called while resize is happening, not after it's done,
   * so it's used to store temporary values, to update UI.
   *
   * In this case, we use the event to store what the new start and end indices
   * of the frame would be if resizing were to stop now.
   *
   * @param {number} x Left edge of the resized element
   * @param {number} y Top edge of the resized element
   * @param {number} w Width of the resized element
   * @param {number} h Height of the resized element
   */
  onResizing (x: number, y: number, w: number): void {
    const { frameLineWidth } = this
    this.resizing = true
    this.newStartIndex = Math.round(x / frameLineWidth)
    this.newEndIndex = Math.round((x + w) / frameLineWidth)
  }

  /**
   * Computs contents for a tooltip being shown when hovering the start of the
   * annotation. Tooltip shows what the current frame number is, or what it
   * would be, if currently resizing and the resize ends here.
   */
  get startIndexForTooltip (): number {
    const { startIndex, newStartIndex } = this
    return newStartIndex !== null ? newStartIndex : startIndex
  }

  /**
   * Computs contents for a tooltip being shown when hovering the end of the
   * annotation. Tooltip shows what the current frame number is, or what it
   * would be, if currently resizing and the resize ends here.
   */
  get endIndexForTooltip (): number {
    const { endIndex, newEndIndex } = this
    return newEndIndex !== null ? newEndIndex : endIndex
  }

  /**
   * Handles "resized" event emitted by vue-draggable-resizable.
   *
   * Note that the params are different from the "dragged" event.
   *
   * @param {number} x Left edge of the resized element
   * @param {number} y Top edge of the resized element
   * @param {number} w Width of the resized element
   * @param {number} h Height of the resized element
   */
  onResized (x: number, y: number, w: number): void {
    const { activeView } = this.editor

    const { annotation, frameLineWidth } = this
    this.resizing = false
    this.cursorOnLeftHandle = false
    this.cursorOnRightHandle = false
    const startIndex = Math.round(x / frameLineWidth)
    const endIndex = Math.round(startIndex + w / frameLineWidth)
    this.$emit(
      'update-annotation-segments',
      annotation,
      [activeView.toOriginBasedIndex(startIndex), activeView.toOriginBasedIndex(endIndex)]
    )
  }

  /**
   * Handles "dragged" event emitted by vue-draggable-resizable
   *
   * Note that the params are different from the "resized" event
   *
   * @param {number} x Left edge of the resized element
   * @param {number} y Top edge of the resized element
   */
  onDragged (x: number): void {
    const { activeView } = this.editor

    const { annotation, width, frameLineWidth } = this
    const startIndex = Math.round(x / frameLineWidth)
    const endIndex = Math.round(startIndex + width / frameLineWidth)
    this.$emit(
      'update-annotation-segments',
      annotation,
      [activeView.toOriginBasedIndex(startIndex), activeView.toOriginBasedIndex(endIndex)]
    )
  }

  onClick (): void {
    // deselect/unhighlight to avoid copy/pasting the wrong annotation
    this.editor.deselectAllAnnotations()
    this.editor.unhighlightAllAnnotations()
    this.annotation.select()
  }

  async onDblClick (): Promise<void> {
    const { annotation, editor } = this
    const annotationClass = await editor.classDialog
      .requestUserSelectClass(annotation.type, annotation.classId)

    if (!annotationClass) { return }

    this.editor.actionManager.do(changeAnnotationClass(this.editor, annotation, annotationClass))
  }

  deleteKeyFrame (key: string): void {
    this.$emit('delete-key-frame', this.annotation, parseInt(key))
  }

  selectKeyFrame (key: string): void {
    this.editor.jumpToFrame(parseInt(key))
    this.annotation.select()
  }
}
</script>

<style lang="scss" scoped>
.video-annotations-item__draggable {
  position: absolute;
  top: 0;
  left: 0;
  border: none;

  &.active {
    z-index: 10 !important;
  }
}

:deep(.video-annotations-item__draggable ) {
  .handle {
    width: 1rem;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    outline: none;
    z-index: 10;
  }

  .handle-ml,
  .handle-mr {
    top: 50%;
    margin-top: 0;
  }

  .handle-ml {
    left: 0;
    transform: translate(-100%, -50%);
  }

  .handle-mr {
    right: 0;
    transform: translate(100%, -50%);
  }
}

.video-annotations-item__ml,
.video-annotations-item__mr {
  display: grid;
  align-items: center;
  height: 100%;
}

.video-annotations-item__ml {
  justify-content: end;
}
.video-annotations-item__mr {
  justify-content: start;
}

.video-annotations-item__ml__icon,
.video-annotations-item__mr__icon {
  max-width: 100%;
  height: 10px;

  &:focus {
    outline: none;
  }

  @include respondTo(1366px) {
    height: 100%;
  }
}

.video-annotations-item__mr__icon {
  transform: rotateZ(180deg);
}
:deep(.handle) {
  border: none;
}
</style>
