<template>
  <div
    v-tooltip="tooltip"
    class="comment-thread-icon"
    :class="{
      'comment-thread-icon--active': commentActive,
      'comment-thread-icon--highlighted': commentThread.isHighlighted,
      'comment-thread-icon--selected': commentThread.isSelected
    }"
    :style="{left: `${centerPoint.x}px`, top: `${centerPoint.y}px`}"
  >
    <img src="/static/imgs/comment.svg">
    <span>{{ commentThread.commentCount }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CommentThreadIconProps } from '@/components/WorkView/Comment/types'
import { View, CommentThread } from '@/engine/models'
import { EditableImagePoint, EditablePoint } from '@/engineCommon/point'
import { TooltipOptions } from '@/types'

/**
 * Renders a comment icon on top of the editor canvas
 */
@Component({ name: 'comment-thread-icon' })
export default class CommentThreadIcon extends Vue implements CommentThreadIconProps {
  @Prop({ required: true, type: Object as () => CommentThread })
  commentThread!: CommentThread

  @Prop({ required: true, type: Object as () => View })
  view!: View

  @State(state => state.workview.currentTool === 'commentator')
  commentActive!: boolean

  /**
   * Shown if the commentator tool is not currently selected, to instruct the user
   * they need to select it in order to open and read comments.
   */
  get tooltip (): TooltipOptions | undefined {
    if (this.commentActive) { return }
    return {
      placement: 'top',
      content: 'Use the Comment tool to read this comment',
      trigger: 'hover focus click'
    }
  }

  /**
   * Center point of the icon on canvas.
   *
   * On the backend, it's stored in relative image coordinates,
   * so we must convert it to canvas coordinates
   *
   * This is then used as "top,left" for css positioning,
   * which then acts as a center using transform translate.
   */
  get centerPoint () {
    const { boundingBox: box } = this.commentThread

    const centerPoint =
      new EditablePoint({
        x: box.x + box.w / 2,
        y: box.y + box.h / 2
      }) as EditableImagePoint

    return this.view.camera.imageViewToCanvasView(centerPoint)
  }
}
</script>

<style lang="scss" scoped>
.comment-thread-icon {
  position: absolute;
  @include noSelect;
  @include row--center;
  opacity: 1;

  width: 25px;
  height: 24px;
  transform: translateX(-50%) translateY(-50%);

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
