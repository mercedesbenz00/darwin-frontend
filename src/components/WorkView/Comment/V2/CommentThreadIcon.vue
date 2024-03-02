<template>
  <div
    v-if="thread && centerPoint"
    v-tooltip="tooltip"
    class="comment-thread-icon"
    :class="{
      'comment-thread-icon--active': isToolActive,
      'comment-thread-icon--highlighted': isHighlighted,
      'comment-thread-icon--selected': isSelected,
      'comment-thread-issue': isIssue
    }"
    :style="styles"
  >
    <div
      v-if="isIssue"
      class="conflict-tags-wrapper"
    >
      <div class="consensus-icon">
        <IconColoredConsensusInverted />
      </div>
      <div
        v-for="tag in thread.issue_types"
        :key="tag"
        class="conflict-tag"
      >
        <IconDuotoneWarn variant="inverted" />
        {{ startCase(tag) }}
      </div>
      <div
        class="iou-number"
        v-for="i in ioUs"
        :key="i.other_annotation_id"
      >
        IoU {{ (i.iou * 100).toFixed(2) }}%
      </div>
    </div>
    <img
      v-if="!isIssue"
      src="/static/imgs/comment.svg"
    >
    <span v-if="!isIssue">{{ commentCount }}</span>
  </div>
</template>

<script lang="ts">
import { startCase } from 'lodash'
import { computed, defineComponent } from 'vue'

import { IconColoredConsensusInverted } from '@/assets/icons/V2/Colored'
import { IconDuotoneWarn } from '@/assets/icons/V2/Duotone'
import { useEditorV2 } from '@/composables/useEditorV2'
import { useStore } from '@/composables/useStore'
import { CanvasPoint, EditablePoint } from '@/engineCommon/point'
import { useCommentStore } from '@/pinia/useCommentStore'
import { TooltipOptions } from '@/types'
/**
 * Renders a comment icon on top of the editor canvas.
 *
 * The key aspect of this component is computing the absolute positioning of the
 * icon on top of the canvas.
 */
export default defineComponent({
  name: 'CommentThreadIcon',
  components: {
    IconDuotoneWarn,
    IconColoredConsensusInverted
  },
  props: {
    threadId: { type: String, required: true },
    viewId: { type: String, required: true }
  },
  setup (props) {
    const commentStore = useCommentStore()
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    const store = useStore()
    const thread = computed(() => commentStore.threadsById[props.threadId])

    const isSelected = computed<boolean>(() => commentStore.activeThreadId === props.threadId)
    const issueTypes = computed<string[]>(() => thread.value?.issue_types ?? [])

    const isHighlighted = computed<boolean>(() => {
      const view = editor?.value?.views.get(props.viewId)
      return view?.commentManager.highlightedCommentThread?.id === props.threadId
    })

    const isToolActive = computed<boolean>(() =>
      store.state.workview.currentTool === 'commentator'
    )

    const tooltip = computed<TooltipOptions | null>(() => {
      if (isSelected.value) { return null }
      return {
        placement: 'top',
        content: 'Use the Comment tool to read this comment',
        trigger: 'hover focus click'
      }
    })

    const centerPoint = computed<CanvasPoint | null>(() => {
      if (!thread.value) { return null }

      const box = thread.value.bounding_box
      const slot = thread.value.slot_name

      const centerPoint = new EditablePoint<'Image'>({
        x: box.x + box.w / 2,
        y: box.y + box.h / 2
      })

      const view = editor?.value.viewsList.find(v => v.isViewsSlot(slot))

      return view?.camera.imageViewToCanvasView(centerPoint) || null
    })

    const commentCount = computed<number>(() => thread.value?.comment_count || 1)

    const isIssue = computed<boolean>(() =>
      issueTypes.value.length > 0 && !thread.value?.resolved
    )

    const ioUs = computed(() => thread.value?.issue_data?.disagreement?.ious)

    const styles = computed(() => {
      const box = thread.value?.bounding_box
      if (!box) { return {} }
      if (isIssue.value) {
        const slot = thread.value.slot_name
        const view = editor?.value.viewsList.find(v => v.isViewsSlot(slot))
        const padding = 8
        if (!view) { return {} }
        const topLeftPoint = view.camera.imageViewToCanvasView(
          new EditablePoint<'Image'>({ x: box.x - padding, y: box.y - padding })
        )
        const bottomRightPoint = view.camera.imageViewToCanvasView(
          new EditablePoint<'Image'>({ x: box.x + box.w + padding, y: box.y + box.h + padding })
        )
        return {
          left: `${topLeftPoint.x}px`,
          top: `${topLeftPoint.y}px`,
          width: `${bottomRightPoint.x - topLeftPoint.x}px`,
          height: `${bottomRightPoint.y - topLeftPoint.y}px`
        }
      }
      return {
        'width': '25px',
        'height': '24px',
        'transform': 'translateX(-50%) translateY(-50%)',
        left: `${centerPoint.value?.x ?? 0}px`,
        top: `${centerPoint.value?.y ?? 0}px`
      }
    })

    return {
      centerPoint,
      commentCount,
      isSelected,
      isHighlighted,
      isToolActive,
      isIssue,
      tooltip,
      thread,
      styles,
      startCase,
      ioUs,
    }
  }
})

</script>

<style lang="scss" scoped>
.comment-thread-icon {
  position: absolute;
  @include noSelect;
  @include row--center;
  opacity: 1;

  img {
    position: absolute;
    @include fullsize;
    width: 100%;
    height: 100%;
  }

  span {
    @include typography(sm);
    color: $colorWhite;
    z-index: 1;
  }
}

.comment-thread-icon--active.comment-thread-icon--selected {
  opacity: 0.2;
}

.comment-thread-issue {
  border: 1.5px dashed $colorContentBad;
}

.conflict-tags-wrapper {
  position: absolute;
  top: -30px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: 100px;
  background: white;
  padding: 2px;

  .consensus-icon {
    border-radius: 100%;
    background: $colorStagesConsensusDefault;
    display: flex;
    height: 16px;
    width: 16px;
    padding: 2px;
    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  .conflict-tag {
    @include typography(sm, inter, 500);
    text-transform: capitalize;
    border-radius: 100px;
    padding-left: 2px;
    padding-right: 4px;
    background: $colorContentBad;
    color: white;
    white-space: nowrap;
    display: flex;
    align-items: center;

    :deep(.warn-icon--inverted) {
      width: 13px;
      height: 13px;
      margin-bottom: -1px;
    }
  }

  .iou-number {
    @include typography(sm, inter, 500);
    text-transform: capitalize;
    border-radius: 100px;
    padding-left: 6px;
    padding-right: 4px;
    background: $colorStatusNegativeSurface;
    color: $colorContentBad;
    white-space: nowrap;
  }
}

:deep(.warn-icon) {
  margin-right: 2px;
}

.comment-thread-icon--active.comment-thread-icon--highlighted {
  filter: brightness(1.2);
}

.comment-thread-icon--active {
  // none, so events are not captured by the icon and
  // are instead passed down to the underlying canvas
  pointer-events: none;
  cursor: pointer;
}

.comment-thread-icon--active:hover,
.comment-thread-icon--active:active {
  opacity: .7;
}
</style>
