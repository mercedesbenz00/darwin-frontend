<template>
  <bottom-drawer
    class="video-annotations__bottom-drawer"
    name="video annotation frames"
    :initial-height="140"
    :max-height="400"
    resizable
  >
    <div class="video-annotations__control-section">
      <video-annotations-video-control class="video-annotations__video-control" />
      <video-annotations-duration-control class="video-annotations__duration-control" />
      <VideoAnnotationsUiControl class="video-annotations__ui-control" />
    </div>
    <div
      class="video-annotations"
      @mousedown.stop.prevent="resetVideoAnnotationsStatus"
    >
      <div
        ref="itemsContainer"
        class="video-annotations__items"
        :style="{ 'height': `${contentHeight}px`, 'width': `${contentWidth}px` }"
        @mousedown.stop.prevent="onFrameLinesMouseDown"
        @mousemove.stop.prevent="onFrameLinesMouseMove"
      >
        <VideoFramesBackground
          class="video-annotations__items__background"
          :class="{
            'video-annotations__items__background--dragging': draggingScrubber,
          }"
          :style="{ 'width': `${contentWidth}px` }"
          :height="contentHeight"
          :frames-count="framesCount || 0"
        >
          <VideoAnnotationsScrubber
            class="video-annotations__items__scrubber"
            :key="activeView.id"
            :editor="editor"
            :current-frame-index="currentFrameIndex"
            :frames-count="framesCount || 0"
            scroller-selector=".video-annotations"
            @frame-index-changed="onFrameIndexChanged"
            @show-context-menu="showContextMenuForSelectedAnnotation"
          />
        </VideoFramesBackground>
        <video-comment-thread-indicator
          v-for="({ sectionIndex, count }) in commentThreadsByFrameIndex"
          :key="sectionIndex"
          :frame-index="sectionIndex"
          :editor="editor"
          :count="count"
          :y-index="verticalIndexMap[`comment-thread-${sectionIndex}`]"
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
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

import {
  defineComponent,
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  watch
} from 'vue'

import { BottomDrawer } from '@/components/WorkView/BottomDrawer'
import ContextMenu from '@/components/WorkView/VideoScrubber/ContextMenu.vue'
import VideoAnnotationsScrubber from '@/components/WorkView/VideoScrubber/V2/VideoAnnotationsScrubber.vue'
import VideoAnnotationsAnnotationControl from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/V2/VideoAnnotationsAnnotationControl.vue'
import VideoAnnotationsVideoControl from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/V2/VideoAnnotationsVideoControl.vue'
import VideoAnnotationsDurationControl from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsDurationControl.vue'
import VideoAnnotationsUiControl from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsUiControl.vue'
import VideoAnnotationsItem from '@/components/WorkView/VideoScrubber/VideoAnnotationsItem/V2/VideoAnnotationsItem.vue'
import VideoCommentThreadIndicator from '@/components/WorkView/VideoScrubber/VideoCommentThreadIndicator.vue'
import VideoFramesBackground from '@/components/WorkView/VideoScrubber/VideoFramesBackground/V2/VideoFramesBackground.vue'
import { ANNOTATION_ITEM_HEIGHT_WITH_BORDER } from '@/components/WorkView/VideoScrubber/consts'
import { useStore } from '@/composables'
import { useActiveView, useAnnotations, useCurrentFrameIndex } from '@/composables/useEditorV2'
import { updateVideoAnnotationSegmentsAction } from '@/engineV2/actions'
import { Editor } from '@/engineV2/editor'
import { Annotation } from '@/engineV2/models'
import { sortRangeVertically } from '@/utils'

export default defineComponent({
  name: 'VideoAnnotations',
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
  },
  props: {
    editor: { required: true, type: Object as () => Editor }
  },
  setup (props) {
    const { getters, state, commit } = useStore()

    const activeView = useActiveView()
    const currentFrameIndex = useCurrentFrameIndex(activeView)
    const annotations = useAnnotations(activeView)

    const tabletCompensation = computed((): number => getters['ui/tabletCompensation'])
    const frameLineWidth = computed(() => state.ui.workviewVideoFrameLineWidth)

    /**
     * Indicates if you are dragging your mouse in an empty area,
     * this should toggle moving behavior of the scrubber
     */
    const draggingScrubber = ref(false)
    const totalVerticalGroups = ref(0)
    const verticalIndexMap = ref<{ [key: string]: number }>({})
    const itemsContainer = ref<HTMLDivElement>()

    const framesCount = computed(() => activeView.value.totalFrames)

    const contentWidth = computed((): number => {
      return frameLineWidth.value * framesCount.value
    })

    const contentHeight = computed((): number =>
      // Allow extra one more row for movements
      (totalVerticalGroups.value + 1) *
        ANNOTATION_ITEM_HEIGHT_WITH_BORDER *
        tabletCompensation.value
    )

    const commentThreadsByFrameIndex = computed(() => {
      const commentThreadMap = activeView.value.commentManager.threads
        .reduce(
          (map, commentThread) => {
            const { sectionIndex } = commentThread
            if (sectionIndex === null) { return map }

            if (map[sectionIndex]) {
              map[sectionIndex].count++
            } else {
              map[sectionIndex] = {
                count: 1,
                sectionIndex
              }
            }
            return map
          },
          {} as { [key: number]: { count: number, sectionIndex: number } }
        )

      return Object.values(commentThreadMap)
    })

    const runVerticalSort = (): void => {
      const result = sortRangeVertically([
        ...annotations.value.map(annotation => ({
          id: `annotation-${annotation.id}`,
          range: [
            annotation.data.segments[0][0],
            // assumes segment second is `null` it's should be full video wide
            annotation.data.segments[annotation.data.segments.length - 1][1] || framesCount.value
          ]
        })),
        ...commentThreadsByFrameIndex.value.map(({ sectionIndex }) => ({
          id: `comment-thread-${sectionIndex}`,
          range: [sectionIndex - 1, sectionIndex + 2],
          priority: 1
        }))
      ])
      verticalIndexMap.value = result.verticalIndexMap
      totalVerticalGroups.value = result.total
    }

    const onFrameIndexChanged = (frameIndex: number): void => {
      props.editor.jumpToFrame(frameIndex)
    }

    const onAnnotations = (): void => {
      runVerticalSort()
    }

    watch(() => annotations.value, onAnnotations, { immediate: true })

    const onUpdateAnnotationSegments = (annotation: Annotation, range: [number, number]): void => {
      const action = updateVideoAnnotationSegmentsAction(activeView.value, annotation, range)
      // force OnAnnotations to be called after we modified any segments
      props.editor.actionManager.do({
        async do () {
          await action.do()
          onAnnotations()
          return true
        },
        async undo () {
          await action.undo()
          onAnnotations()
          return true
        }
      })
    }

    const contextMenuVisible = ref(false)
    const contextMenuX = ref(0)
    const contextMenuY = ref(0)
    /**
     * Offset x inside the annotation where context menu is shown
     */
    const contextMenuOffsetX = ref(0)
    const contextMenuAnnotation = ref<Annotation | null>(null)
    const contextMenuDeleteKeyFrame = ref<number | null>(null)

    const jumpToFrameFromMouseEvent = (event: MouseEvent): void => {
      commit('workview/DESELECT_ALL_ANNOTATIONS')
      if (!itemsContainer.value) { return }

      /**
       * MouseEvent `offsetX`, `offsetY` is offset to bounding box
       * of the most child element that catched the mouse event.
       *
       * We need to calculate the `offsetX` inside the `.video_annotations_items`
       * element's bounding box
       */
      const rect = itemsContainer.value.getBoundingClientRect()
      const offsetX = event.clientX - rect.left
      props.editor.lqJumpToFrame(Math.floor(offsetX / frameLineWidth.value))
    }

    const onFrameLinesMouseDown = (event: MouseEvent): void => {
      const target = event.target as HTMLElement
      // We should only catch click event on the empty area
      if (
        !target ||
        // this is required to filter out `path` being clicked
        typeof target.className !== 'string' ||
        !(
          target.className.includes('bottom-drawer__wrapper') ||
          target.className.includes('video-annotations') ||
          target.className.includes('video-frames-background')
        )
      ) { return }
      if (contextMenuVisible.value) {
        contextMenuVisible.value = false
        return
      }

      draggingScrubber.value = true
      jumpToFrameFromMouseEvent(event)
    }

    const onFrameLinesMouseUp = (): void => {
      draggingScrubber.value = false
      props.editor.jumpToFrame(props.editor.activeView.currentFrameIndex)
    }

    const onFrameLinesMouseMove = (event: MouseEvent): void => {
      if (!draggingScrubber.value) { return }
      jumpToFrameFromMouseEvent(event)
    }

    const onDeleteKeyFrame = (annotation: Annotation, key: number): void => {
      contextMenuAnnotation.value = annotation
      contextMenuDeleteKeyFrame.value = key
    }

    /**
     * Calculate the position to show the context menu
     * it also calculates the `contextMenuOffsetX` which is offset-x inside the annotation element
     */
    const showContextMenu = (event: MouseEvent, annotation: Annotation): void => {
      const annotationElem = document.querySelector(`#video-annotations-item-${annotation.id}`)
      if (!annotationElem) { return }

      const boundingRect = annotationElem.getBoundingClientRect()

      contextMenuVisible.value = true
      contextMenuX.value = event.pageX
      contextMenuY.value = boundingRect.top + boundingRect.height / 2
      contextMenuOffsetX.value = event.pageX - boundingRect.left
      contextMenuAnnotation.value = annotation
    }

    const showContextMenuForClickedAnnotation = (
      event: MouseEvent,
      annotation: Annotation
    ): void => {
      showContextMenu(event, annotation)
    }

    const showContextMenuForSelectedAnnotation = (event: MouseEvent): void => {
      const { selectedAnnotation } = activeView.value.annotationManager
      if (!selectedAnnotation) { return }
      showContextMenu(event, selectedAnnotation)
    }

    const hideContextMenu = (): void => {
      contextMenuVisible.value = false
      contextMenuAnnotation.value = null
      contextMenuDeleteKeyFrame.value = null
    }

    const resetVideoAnnotationsStatus = (evt: MouseEvent): void => {
      // To prevent click on scrubber deselect all
      const videoScrubberDOM = document.querySelector('#VideoAnnotationScrubber') as HTMLElement
      if (videoScrubberDOM && !videoScrubberDOM.contains(evt.target as HTMLElement)) {
        activeView.value.deselectAll()
      }
    }

    onMounted(() => {
      // mouseup is not being triggered for `div` elements
      // so we need to reset the dragging status of scrubber on document.mouseup
      document.addEventListener('mouseup', onFrameLinesMouseUp)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mouseup', onFrameLinesMouseUp)
    })

    watch(
      commentThreadsByFrameIndex,
      () => { runVerticalSort() },
      { immediate: true }
    )

    return {
      activeView,
      itemsContainer,
      verticalIndexMap,
      annotations,
      currentFrameIndex,
      contentWidth,
      contentHeight,
      draggingScrubber,
      frameLineWidth,
      framesCount,
      commentThreadsByFrameIndex,
      onFrameIndexChanged,
      onUpdateAnnotationSegments,
      onFrameLinesMouseDown,
      onFrameLinesMouseUp,
      onFrameLinesMouseMove,
      onDeleteKeyFrame,
      contextMenuVisible,
      contextMenuX,
      contextMenuY,
      contextMenuOffsetX,
      contextMenuAnnotation,
      contextMenuDeleteKeyFrame,
      showContextMenuForClickedAnnotation,
      showContextMenuForSelectedAnnotation,
      hideContextMenu,
      resetVideoAnnotationsStatus
    }
  }
})
</script>

<style lang="scss" scoped>
$control-height: 30px;

.video-annotations {
  position: relative;
  height: 100%;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  background: $colorAliceBlue;
  overflow: hidden;
  @include scrollbarV2;

  &__bottom-drawer {
    // avoid overlapping the bottom-bar toogle
    // with the video-annotations one
    :deep(.bottom-drawer__toggle) {
      margin-left: 54px;
    }
  }

  &__control-section {
    @include row;
    position: absolute;
    left: 0;
    top: -$control-height;
    height: $control-height;
  }

  &__video-control {
    height: 100%;
  }

  &__ui-control {
    height: 100%;
    border-top-right-radius: 3px;
  }

  &__annotation-control {
    position: absolute;
    right: 0;
    top: -$control-height;
    height: $control-height;
  }

  &__items {
    position: relative;
    @include col;
    height: 100%;
    min-height: 100%;

    &__background {
      position: relative;
      cursor: pointer;

      &--dragging {
        cursor: grabbing;
      }
    }
  }
}
</style>
