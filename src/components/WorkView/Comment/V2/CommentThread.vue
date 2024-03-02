<template>
  <div
    v-if="thread && !thread.resolved && team"
    class="comment-thread"
    :style="style"
  >
    <comment-item
      v-for="(comment, index) in comments"
      :key="comment.id"
      :comment-id="comment.id"
      :team-id="team.id"
      :is-resolvable="index === 0 && canResolve"
      :is-thread-deletable="index === 0 && canDelete"
    />
    <div
      v-if="loading"
      class="comment-thread__reply-box"
    >
      Loading
    </div>
    <div
      v-else-if="!hasNewComments"
      class="comment-thread__reply-box"
      @click="addNewComment"
      role="button"
    >
      Reply
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watch } from 'vue'

import { useAuth, useStore, useTheme } from '@/composables'
import { useActiveView } from '@/composables/useEditorV2'
import { EditableImagePoint, EditablePoint, Point } from '@/engineCommon/point'
import { useCommentStore } from '@/pinia/useCommentStore'
import { TeamPayload } from '@/store/types'
import { getElement } from '@/utils/getElement'

import CommentItem from './CommentItem.vue'

/**
 * Renders an open comment thread.
 *
 * From this UI, a user can
 * - delete the thread if they are the author
 * - resolve it
 * - edit own comments
 * - delete own comments
 * - reply with a new comment.
 */
export default defineComponent({
  name: 'CommentThreadView',
  components: { CommentItem },

  setup () {
    const theme = useTheme()
    const commentStore = useCommentStore()
    const { state } = useStore()

    const { isAuthorized } = useAuth()

    const activeView = useActiveView()

    const thread = computed(() => commentStore.activeThread || null)

    const comments = computed(() => {
      const value = thread.value
      if (!value) { return [] }
      return commentStore.comments.filter(c => c.comment_thread_id === value.id)
    })

    const dataset = computed(() => state.workview.dataset)
    const currentUser = computed(() => state.user.profile)
    const stage = computed(() => state.workview.selectedStageInstance)

    /**
     * Team associated to current dataset,
     * not necessarily currently signed in user's team
     */
    const team = computed((): TeamPayload | null => {
      const teams: TeamPayload[] = state.team.teams
      return teams.find(t => t.id === dataset.value?.team_id) || null
    })

    const DEFAULT_WIDTH = ref(320)
    onMounted(() => {
      DEFAULT_WIDTH.value *= theme.getCurrentScale()
    })

    const canDelete = computed(() => {
      if (!thread.value) { return false }

      const threadResource = { author_id: thread.value.author_id }

      return (
        isAuthorized('delete_comment_thread', {
          subject: 'comment_thread', resource: threadResource
        }) ||
        isAuthorized('delete_comment_thread', { subject: 'stage', resource: stage }) ||
        isAuthorized('delete_comment_thread')
      )
    })

    const imageViewToCanvasView = (point: EditableImagePoint): Point<unknown> => {
      const mainView = getElement('main-view')
      if (!mainView) { return new Point({ x: 0, y: 0 }) }

      // Get canvas position to compensate split-screen view
      const canvasPos = activeView.value.mainLayer.canvas.getBoundingClientRect()
      // Get main view position to compensate absolute position of the canvas
      const mainViewPos = mainView.getBoundingClientRect()

      return new Point({
        x: activeView.value.camera.imageViewToCanvasView(point).x + canvasPos.x - mainViewPos.x,
        y: activeView.value.camera.imageViewToCanvasView(point).y + canvasPos.y - mainViewPos.y
      })
    }

    const style = computed(() => {
      if (!thread.value) { return {} }
      const box = thread.value.bounding_box
      const boxTopLeft = imageViewToCanvasView(new EditablePoint({ x: box.x, y: box.y }))
      const boxTopRight = imageViewToCanvasView(new EditablePoint({ x: box.x + box.w, y: box.y }))

      const maxHeight = `calc(100vh - ${200 * theme.getCurrentScale() + boxTopRight.y}px)`

      if (boxTopLeft.x - DEFAULT_WIDTH.value < 0) {
        return {
          width: `${DEFAULT_WIDTH.value}px`,
          maxHeight,
          top: `${boxTopRight.y}px`,
          left: `${boxTopRight.x + 5}px`
        }
      } else {
        return {
          width: `${DEFAULT_WIDTH.value}px`,
          maxHeight,
          top: `${boxTopLeft.y}px`,
          left: `${boxTopLeft.x - DEFAULT_WIDTH.value - 5}px`
        }
      }
    })

    const deleteCommentThread = async (): Promise<void> => {
      if (!thread.value) { return }
      await commentStore.deleteCommentThread(thread.value.id)
    }

    const resolveCommentThread = async (): Promise<void> => {
      if (!thread.value) { return }
      await commentStore.resolveCommentThread(thread.value.id)
    }

    const loading = ref(false)

    const loadComments = async (): Promise<void> => {
      loading.value = true
      if (!thread.value || thread.value.isNew) { return }
      await commentStore.loadComments(thread.value.id)
      loading.value = false
    }

    watch(() => thread.value, loadComments)

    const canResolve = computed<boolean>(() =>
      isAuthorized('update_comment_thread', {
        subject: 'comment_thread',
        resource: { author_id: thread.value?.author_id }
      })
    )

    onMounted(() => loadComments())

    const hasNewComments = computed<boolean>(() => comments.value.some(c => c.isNew))

    const addNewComment = (): void => {
      if (!commentStore.activeThread) { return }
      if (!currentUser.value) { return }
      commentStore.addNewComment(commentStore.activeThread.id, currentUser.value.id)
    }

    return {
      addNewComment,
      canDelete,
      canResolve,
      comments,
      currentUser,
      deleteCommentThread,
      hasNewComments,
      loading,
      resolveCommentThread,
      style,
      team,
      thread
    }
  }
})
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
  cursor: default;
}
.comment-thread__reply-box {
  padding: 10px 15px;
  @include typography(md, default);
  line-height: 20px;
  color: $colorAliceNight;
}
</style>
