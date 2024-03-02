<template>
  <div
    v-if="commentThread && !commentThread.resolved"
    class="comment-thread"
    :style="style"
    :class="{'comment-thread--hidden': commentThread.isMoving}"
  >
    <comment-item
      v-for="(comment, index) in comments"
      :key="comment.id"
      :comment="comment"
      :comment-thread="commentThread"
      :team="team"
      :show-resolve="showResolve(index)"
      :show-delete-comment-thread="index === 0 && canDelete"
      @delete-comment="deleteComment(comment)"
      @update-comment="$event => updateComment(comment, $event)"
      @delete-comment-thread="deleteCommentThread"
      @resolve-comment-thread="resolveCommentThread"
    />
    <reply-box
      v-if="currentUser"
      :author="currentUser"
      :stick-author="comments.length === 0"
      @cancel="cancelReplyBox"
      @post="$event => createComment($event)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ReplyBox from '@/components/WorkView/Comment/Shared/ReplyBox.vue'
import { View } from '@/engine/models'
import { EditableImagePoint, EditablePoint, Point } from '@/engineCommon/point'
import { Comment, CommentThread } from '@/store/modules/comment/types'
import {
  DatasetItemPayload,
  DatasetPayload,
  RootState,
  TeamPayload,
  UserPayload,
  WorkflowStagePayload
} from '@/store/types'
import { ErrorCodes } from '@/utils/error/errors'
import { getElement } from '@/utils/getElement'

import CommentItem from './CommentItem.vue'

@Component({
  name: 'comment-thread',
  components: { CommentItem, ReplyBox }
})
export default class CommentThreadView extends Vue {
  @Prop({ required: true })
  view!: View

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  @State((state: RootState) => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload

  @State((state: RootState) => state.user.profile)
  currentUser!: UserPayload | null

  @State((state: RootState) => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload

  /**
   * Team associated to current dataset,
   * not necessarily currently signed in user's team
   */
  get team (): TeamPayload | null {
    const { dataset } = this
    const teams: TeamPayload[] = this.$store.state.team.teams
    return teams.find(t => t.id === dataset.team_id) || null
  }

  DEFAULT_WIDTH: number = 320

  get commentThread (): CommentThread | null {
    return this.view.commentThread
  }

  get comments (): Comment[] {
    const { commentThread } = this
    if (!commentThread) { return [] }
    return commentThread.comments
  }

  get canDelete () {
    const { commentThread, stage } = this
    if (!commentThread) { return false }

    const threadResource = { author_id: commentThread.authorId }

    return (
      this.$can('delete_comment_thread', { subject: 'comment_thread', resource: threadResource }) ||
      this.$can('delete_comment_thread', { subject: 'stage', resource: stage }) ||
      this.$can('delete_comment_thread')
    )
  }

  imageViewToCanvasView (point: EditableImagePoint) {
    const mainView = getElement('main-view')

    if (!mainView) { return { x: 0, y: 0 } }

    // Get canvas position to compensate split-screen view
    const canvasPos = this.view.mainLayer.canvas.getBoundingClientRect()
    // Get main view position to compensate absolute position of the canvas
    const mainViewPos = mainView.getBoundingClientRect()

    return new Point({
      x: this.view.camera.imageViewToCanvasView(point).x + canvasPos.x - mainViewPos.x,
      y: this.view.camera.imageViewToCanvasView(point).y + canvasPos.y - mainViewPos.y
    })
  }

  get style () {
    const { commentThread } = this
    if (!commentThread) { return {} }
    const box = commentThread.boundingBox
    const boxTopLeft = this.imageViewToCanvasView(new EditablePoint({ x: box.x, y: box.y }))
    const boxTopRight =
      this.imageViewToCanvasView(new EditablePoint({ x: box.x + box.w, y: box.y }))

    const maxHeight = `calc(100vh - ${200 * this.$theme.getCurrentScale() + boxTopRight.y}px)`

    if (boxTopLeft.x - this.DEFAULT_WIDTH < 0) {
      return {
        width: `${this.DEFAULT_WIDTH}px`,
        maxHeight,
        top: `${boxTopRight.y}px`,
        left: `${boxTopRight.x + 5}px`
      }
    } else {
      return {
        width: `${this.DEFAULT_WIDTH}px`,
        maxHeight,
        top: `${boxTopLeft.y}px`,
        left: `${boxTopLeft.x - this.DEFAULT_WIDTH - 5}px`
      }
    }
  }

  mounted () {
    this.DEFAULT_WIDTH *= this.$theme.getCurrentScale()
    this.loadComments()
  }

  cancelReplyBox () {
    if (this.comments.length === 0) { this.$emit('delete-comment-thread') }
  }

  async deleteCommentThread () {
    const { commentThread } = this
    if (!commentThread) { return }
    await this.$store.dispatch('comment/removeCommentThread', commentThread)
  }

  async resolveCommentThread () {
    const { commentThread } = this
    if (!commentThread) { return }
    const { error } = await this.$store.dispatch('comment/resolveCommentThread', commentThread)
    if (error) {
      this.$store.dispatch(
        'toast/notify',
        { content: 'You cannot resolve comment threads started by users of a higher rank' }
      )
    }
  }

  @Watch('commentThread.id')
  async loadComments () {
    const { commentThread } = this
    if (!commentThread) { return }
    await this.$store.dispatch('comment/loadCommentsForThread', commentThread)
  }

  async createComment (body: string): Promise<void> {
    const { commentThread: thread } = this
    if (!thread) { return }
    const payload = { body, threadId: thread.id }
    const { error } = await this.$store.dispatch('comment/createComment', payload)

    if (error && error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
      this.$store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      return
    }

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }

  async updateComment (comment: Comment, updates: { id: number, body: string }) {
    const payload = { ...comment, body: updates.body }
    const { error } = await this.$store.dispatch('comment/updateComment', payload)
    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }
  }

  async deleteComment (comment: Comment) {
    const { error } = await this.$store.dispatch('comment/removeComment', comment)
    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }
  }

  showResolve (index: number) {
    // The resolve icon is only visible in the first comment item of the thread
    if (index > 0) { return false }
    return this.$can('update_comment_thread', {
      subject: 'comment_thread',
      resource: this.commentThread
    })
  }
}
</script>

<style lang="scss" scoped>
.comment-thread {
  @include col;
  position: absolute;
  border-radius: $border-radius-default;
  background: $colorWhite;
  overflow: auto;
  box-shadow: 0px 15px 30px rgba(20, 5, 60, 0.2);
  z-index: var(--workview-comment-thread);
  min-height: 140px;
}

.comment-thread--hidden {
  display: none;
}
</style>
