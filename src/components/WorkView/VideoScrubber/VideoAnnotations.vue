<template>
  <bottom-drawer
    class="video-annotations__bottom-drawer"
    name="video annotation frames"
    :initial-height="140"
    :max-height="400"
    resizable
  >
    <div class="video-annotations__control-section">
      <video-annotations-video-control
        class="video-annotations__video-control"
        :editor="editor"
      />
      <video-annotations-duration-control class="video-annotations__duration-control" />
      <video-annotations-ui-control class="video-annotations__ui-control" />
    </div>
    <div
      class="video-annotations"
      @mousedown.stop.prevent="resetVideoAnnotationsStatus"
    >
      <div class="video-annotations__workbox">
        <div
          class="video-annotations__workbox__content"
          :style="{ width: `${contentWidth}px`, height: `${contentHeight}px` }"
        >
          <div
            ref="itemsContainer"
            class="video-annotations__items"
            :style="{ width: `${frameLinesWidth}px` }"
            @mousedown.stop.prevent="onFrameLinesMouseDown"
            @mousemove.stop.prevent="onFrameLinesMouseMove"
          >
            <video-frames-background
              class="video-annotations__items__background"
              :style="{ width: `${frameLinesWidth}px` }"
              :height="contentHeight"
              :editor="editor"
            />
            <video-comment-thread-indicator
              v-for="({ frameIndex, count }) in commentThreadsByFrameIndex"
              :key="frameIndex"
              :frame-index="frameIndex"
              :editor="editor"
              :count="count"
              :y-index="verticalIndexMap[`comment-thread-${frameIndex}`]"
            />
            <video-annotations-item
              v-for="annotation in annotations"
              :id="`video-annotations-item-${annotation.id}`"
              :key="annotation.id"
              :annotation="annotation"
              :editor="editor"
              :y-index="verticalIndexMap[`annotation-${annotation.id}`]"
              @contextmenu="showContextMenuForClickedAnnotation($event, annotation)"
              @delete-key-frame="onDeleteKeyFrame"
              @update-annotation-segments="onUpdateAnnotationSegments"
            />
          </div>
          <video-annotations-scrubber
            :editor="editor"
            :current-frame-index="currentFrameIndex"
            scroller-selector=".video-annotations__workbox"
            @frame-index-changed="onFrameIndexChanged"
            @show-context-menu="showContextMenuForSelectedAnnotation"
          />
        </div>
      </div>
    </div>
    <video-annotations-annotation-control
      class="video-annotations__annotation-control"
      :editor="editor"
    />
    <context-menu
      :annotation="contextMenuAnnotation"
      :editor="editor"
      :offset-x="contextMenuOffsetX"
      :x="contextMenuX"
      :y="contextMenuY"
      :visible="contextMenuVisible"
      :keyframe-to-delete="contextMenuDeleteKeyFrame"
      @close="hideContextMenu"
    />
  </bottom-drawer>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

import { BottomDrawer } from '@/components/WorkView/BottomDrawer'
import { updateVideoAnnotationSegmentsAction } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { Annotation, CommentThread } from '@/engine/models'
import { RootState } from '@/store/types'
import { sortRangeVertically } from '@/utils'

import ContextMenu from './ContextMenu.vue'
import VideoAnnotationsAnnotationControl from './VideoAnnotationsControl/VideoAnnotationsAnnotationControl.vue'
import VideoAnnotationsDurationControl from './VideoAnnotationsControl/VideoAnnotationsDurationControl.vue'
import VideoAnnotationsUiControl from './VideoAnnotationsControl/VideoAnnotationsUiControl.vue'
import VideoAnnotationsVideoControl from './VideoAnnotationsControl/VideoAnnotationsVideoControl.vue'
import VideoAnnotationsItem from './VideoAnnotationsItem/VideoAnnotationsItem.vue'
import VideoAnnotationsScrubber from './VideoAnnotationsScrubber.vue'
import VideoCommentThreadIndicator from './VideoCommentThreadIndicator.vue'
import VideoFramesBackground from './VideoFramesBackground/VideoFramesBackground.vue'
import { ANNOTATION_ITEM_HEIGHT_WITH_BORDER } from './consts'

@Component({
  name: 'video-annotations',
  components: {
    BottomDrawer,
    ContextMenu,
    VideoAnnotationsAnnotationControl,
    VideoAnnotationsDurationControl,
    VideoAnnotationsUiControl,
    VideoAnnotationsVideoControl,
    VideoAnnotationsItem,
    VideoAnnotationsScrubber,
    VideoCommentThreadIndicator,
    VideoFramesBackground
  }
})
export default class VideoAnnotations extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @Getter('tabletCompensation', { namespace: 'ui' })
  tabletCompensation!: number

  @State((state: RootState) => state.ui.workviewBottomBarCollapsed)
  bottomBarCollapsed!: boolean

  @State((state: RootState) => state.ui.workviewVideoFrameLineWidth)
  frameLineWidth!: number

  @State((state: RootState) => state.comment.commentThreads.filter(t => !t.resolved))
  commentThreads!: CommentThread[]

  /**
   * Indicates if you are dragging your mouse in an empty area,
   * this should toggle moving behavior of the scrubber
   */
  draggingScrubber: boolean = false
  totalVerticalGroups: number = 0
  verticalIndexMap: { [key: string]: number } = {}

  $refs!: {
    itemsContainer?: HTMLDivElement
  }

  get annotations (): Annotation[] {
    return this.editor.activeView.viewsAnnotations
  }

  get currentFrameIndex (): number {
    return this.editor.activeView.zeroBasedCurrentFrameIndex
  }

  get framesCount (): number {
    return this.editor.activeView.totalFrames
  }

  get contentWidth (): number {
    return this.framesCount * this.frameLineWidth + 5
  }

  get contentHeight (): number {
    // Allow extra one more row for movements
    return (
      (this.totalVerticalGroups + 1) *
      ANNOTATION_ITEM_HEIGHT_WITH_BORDER *
      this.tabletCompensation
    )
  }

  get frameLinesWidth (): number {
    return this.framesCount * this.frameLineWidth
  }

  get commentThreadsByFrameIndex (): { count: number, frameIndex: number }[] {
    const commentThreadMap = this.editor.activeView.storeCommentThreads.reduce(
      (map: { [key: number]: { count: number, frameIndex: number } }, commentThread) => {
        const { frameIndex } = commentThread
        if (typeof frameIndex === 'undefined') { return map }
        const zeroBasedFrameIndex = this.editor.activeView.toZeroBasedIndex(frameIndex)

        if (map[zeroBasedFrameIndex]) {
          map[zeroBasedFrameIndex].count++
        } else {
          map[zeroBasedFrameIndex] = {
            count: 1,
            frameIndex: zeroBasedFrameIndex
          }
        }
        return map
      },
      {}
    )

    return Object.values(commentThreadMap)
  }

  mounted (): void {
    // mouseup is not being triggered for `div` elements
    // so we need to reset the dragging status of scrubber on document.mouseup
    document.addEventListener('mouseup', this.onDocumentMouseUp)
    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('mouseup', this.onDocumentMouseUp)
    })
  }

  @Watch('annotations', { immediate: true })
  onAnnotations (): void {
    this.runVerticalSort()
  }

  @Watch('commentThreadsByFrameIndex', { immediate: true })
  onCommentThreads (): void { this.runVerticalSort() }

  runVerticalSort (): void {
    const { verticalIndexMap, total } = sortRangeVertically([
      ...this.annotations.map(annotation => ({
        id: `annotation-${annotation.id}`,
        range: [
          annotation.data.segments[0][0],
          // assumes segment second is `null` it's should be full video wide
          annotation.data.segments[annotation.data.segments.length - 1][1] || this.framesCount
        ]
      })),
      ...this.commentThreadsByFrameIndex.map(({ frameIndex }) => ({
        id: `comment-thread-${frameIndex}`,
        range: [frameIndex - 1, frameIndex + 2],
        priority: 1
      }))
    ])
    this.verticalIndexMap = verticalIndexMap
    this.totalVerticalGroups = total
  }

  onFrameIndexChanged (frameIndex: number): void {
    this.editor.jumpToFrame(frameIndex)
  }

  onUpdateAnnotationSegments (annotation: Annotation, range: [number, number]) {
    const action = updateVideoAnnotationSegmentsAction(this.editor.activeView, annotation, range)
    const videoAnnotations = this
    // force OnAnnotations to be called after we modified any segments
    this.editor.actionManager.do({
      async do () {
        await action.do()
        videoAnnotations.onAnnotations()
        return true
      },
      async undo () {
        await action.undo()
        videoAnnotations.onAnnotations()
        return true
      }
    })
  }

  onFrameLinesMouseDown (event: MouseEvent) {
    const target = event.target as HTMLElement
    // We should only catch click event on the empty area
    if (
      !target ||
      typeof target.className !== 'string' || // this is required to filter out `path` being clicked
      !target.className.includes('video-annotations__items')
    ) { return }
    if (this.contextMenuVisible) {
      this.contextMenuVisible = false
      return
    }

    this.draggingScrubber = true
    this.jumpToFrameFromMouseEvent(event)
  }

  onFrameLinesMouseMove (event: MouseEvent) {
    if (!this.draggingScrubber) { return }
    this.jumpToFrameFromMouseEvent(event)
  }

  onDocumentMouseUp () {
    this.draggingScrubber = false
  }

  jumpToFrameFromMouseEvent (event: MouseEvent) {
    this.$store.commit('workview/DESELECT_ALL_ANNOTATIONS')
    const { itemsContainer } = this.$refs
    if (!itemsContainer) { return }

    /**
     * MouseEvent `offsetX`, `offsetY` is offset to bounding box
     * of the most child element that catched the mouse event.
     *
     * We need to calculate the `offsetX` inside the `.video_annotations_items`
     * element's bounding box
     */
    const rect = itemsContainer.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    this.editor.jumpToFrame(Math.floor(offsetX / this.frameLineWidth))
  }

  onDeleteKeyFrame (annotation: Annotation, key: number): void {
    this.contextMenuAnnotation = annotation
    this.contextMenuDeleteKeyFrame = key
  }

  contextMenuVisible: boolean = false
  contextMenuX: number = 0
  contextMenuY: number = 0
  /**
   * Offset x inside the annotation where context menu is shown
   */
  contextMenuOffsetX: number = 0
  contextMenuAnnotation: Annotation | null = null
  contextMenuDeleteKeyFrame: number | null = null

  showContextMenuForClickedAnnotation (event: MouseEvent, annotation: Annotation) {
    this.showContextMenu(event, annotation)
  }

  showContextMenuForSelectedAnnotation (event: MouseEvent) {
    const { selectedAnnotation } = this.editor.activeView
    if (!selectedAnnotation) { return }
    this.showContextMenu(event, selectedAnnotation)
  }

  /**
   * Calculate the position to show the context menu
   * it also calculates the `contextMenuOffsetX` which is offset-x inside the annotation element
   */
  showContextMenu (event: MouseEvent, annotation: Annotation) {
    const annotationElem = document.querySelector(`#video-annotations-item-${annotation.id}`)
    if (!annotationElem) { return }

    const boundingRect = annotationElem.getBoundingClientRect()

    this.contextMenuVisible = true
    this.contextMenuX = event.pageX
    this.contextMenuY = boundingRect.top + boundingRect.height / 2
    this.contextMenuOffsetX = event.pageX - boundingRect.left
    this.contextMenuAnnotation = annotation
  }

  hideContextMenu () {
    this.contextMenuVisible = false
    this.contextMenuAnnotation = null
    this.contextMenuDeleteKeyFrame = null
  }

  resetVideoAnnotationsStatus (evt: MouseEvent) {
    // To prevent click on scrubber deselect all
    const videoScrubberDOM = document.querySelector('.video-scrubber__draggable') as HTMLElement
    if (videoScrubberDOM && !videoScrubberDOM.contains(evt.target as HTMLElement)) {
      this.editor.deselectAll()
    }
  }
}
</script>

<style lang="scss" scoped>
.video-annotations__bottom-drawer {
  // avoid overlapping the bottom-bar toogle
  // with the video-annotations one
  :deep(.bottom-drawer__toggle) {
    margin-left: 54px;
  }
}

$control-height: 30px;

.video-annotations__control-section {
  @include row;
  position: absolute;
  left: 0;
  top: -$control-height;
  height: $control-height;
}

.video-annotations__video-control {
  height: 100%;
}

.video-annotations__ui-control {
  height: 100%;
  border-top-right-radius: 3px;
}

.video-annotations__annotation-control {
  position: absolute;
  right: 0;
  top: -$control-height;
  height: $control-height;
}

.video-annotations {
  @include col;
  width: 100%;
  height: 100%;
  background: $colorAliceBlue;
  overflow: hidden;
}

.video-annotations__workbox {
  position: relative;
  width: 100%;
  height: 100%;
  @include scrollbarV2;
  overflow: auto;

  &__content {
    position: relative;
    min-height: 100%;
  }
}

.video-annotations__items {
  position: relative;
  margin-right: 5px;
  margin-left: 5px;
  height: 100%;
}

.video-annotations__items__background {
  position: absolute;
  @include fullsize;
}
</style>
