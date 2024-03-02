<template>
  <div class="comment-item">
    <div class="comment-item__header">
      <comment-profile
        :author="author"
        :comment="comment"
        class="comment-item__profile"
      />
      <template v-if="isEditing && !isNew">
        <div class="comment-item__edit-actions">
          <secondary-button
            size="small"
            @click="cancelEdit"
          >
            Cancel
          </secondary-button>
          <positive-button
            :disabled="!editedBody || !comment || editedBody === comment.body"
            size="small"
            @click="submitEdit"
          >
            Save
          </positive-button>
        </div>
      </template>
      <template v-else>
        <div class="comment-item__datetime">
          {{ humanizedTime }}
        </div>
        <v-popover
          trigger="manual"
          :open="isOverlayOpen"
          placement="right"
          :popover-class="popoverClass"
        >
          <div
            class="comment-item__more"
            @click="toggleOverlay"
          />
          <template slot="popover">
            <button
              class="comment-item__overlay__item comment-item__overlay__item--edit-comment"
              :disabled="!(isEditable && canEditComment)"
              @click="editComment"
            >
              Edit Comment
            </button>
            <button
              class="comment-item__overlay__item comment-item__overlay__item--delete-comment"
              :disabled="!(isEditable && canDeleteComment)"
              @click="deleteComment"
            >
              Delete Comment
            </button>
            <button
              v-if="isThreadDeletable"
              class="comment-item__overlay__item comment-item__overlay__item--delete-thread"
              :disabled="!isEditable"
              @click="deleteCommentThread"
            >
              Delete Thread
            </button>
          </template>
        </v-popover>
        <div
          v-if="isResolvable"
          v-tooltip="{
            placement: 'top',
            content: 'Resolve'
          }"
          class="comment-item__resolve"
          @click="resolveCommentThread"
        >
          <img src="/static/imgs/resolve-gray-icon.svg">
        </div>
      </template>
    </div>
    <div
      class="comment-item__body"
      :class="{ 'comment-item__body--editing': isEditing }"
    >
      <div
        class="comment-item__non-edit"
        v-html="commentBodyHtml"
      />
      <div class="comment-item__edit">
        <comment-edit-box
          v-model="editedBody"
          placeholder="Reply"
          class="comment-item__edit-textarea"
          :focus="isEditing"
          @enter="submitEdit"
          @cancel="cancelEdit"
        />
        <div
          class="comment-item__edit__new-actions"
          v-if="isNew"
        >
          <secondary-button
            @click="cancelEdit"
            size="small"
          >
            Cancel
          </secondary-button>
          <positive-button
            :disabled="!editedBody || !comment || editedBody === comment.body"
            @click="submitEdit"
            size="small"
          >
            Save
          </positive-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import CommentEditBox from '@/components/WorkView/Comment/Shared/CommentEditBox.vue'
import CommentProfile from '@/components/WorkView/Comment/Shared/CommentProfile.vue'
import { useAuth } from '@/composables/useAuth'
import { useStore } from '@/composables/useStore'
import { useCommentStore } from '@/pinia/useCommentStore'
import { MembershipPayload } from '@/store/types'
import { commentToHtml, getAgoString } from '@/utils'

/**
 * Renders a single comment in an open comment thread.
 */
export default defineComponent({
  name: 'CommentItem',
  components: { CommentEditBox, CommentProfile },
  props: {
    commentId: { type: String, required: true },
    isResolvable: { type: Boolean, required: false, default: false },
    isThreadDeletable: { type: Boolean, required: false, default: false },
    teamId: { type: Number, required: true }
  },
  setup (props) {
    const store = useStore()
    const commentStore = useCommentStore()

    const { isAuthorized } = useAuth()

    const comment = computed(() => commentStore.comments.find(c => c.id === props.commentId))

    const getAuthor: (teamId: number, userId: number) => MembershipPayload | null =
      store.getters['team/findMembershipByTeamIdUserId']

    const author = computed<MembershipPayload | null>(() => {
      if (!comment.value) { return null }
      return getAuthor(props.teamId, comment.value.author_id)
    })

    const isOverlayOpen = ref(false)
    const isEditing = ref(false)
    const editedBody = ref('')

    const isNew = computed<boolean>(() => !!comment.value?.isNew)

    const canEditComment = computed<boolean>(() => {
      if (!comment.value) { return false }
      const commentResource = { author_id: comment.value.author_id }
      return (
        isAuthorized('update_comment', { subject: 'comment', resource: commentResource }) ||
        isAuthorized('update_comment')
      )
    })

    const canDeleteComment = computed<boolean>(() => {
      if (!comment.value) { return false }
      const commentResource = { author_id: comment.value.author_id }
      return (
        isAuthorized('delete_comment', { subject: 'comment', resource: commentResource }) ||
        isAuthorized('delete_comment')
      )
    })

    const commentBodyHtml = computed<string>(() => commentToHtml(comment.value?.body || ''))
    const humanizedTime = computed<string>(() => getAgoString(comment.value?.inserted_at))

    const isEditable =
      computed<boolean>(() => store.state.user.profile?.id === comment.value?.author_id)

    const toggleOverlay = (): void => {
      isOverlayOpen.value = !isOverlayOpen.value
    }

    const editComment = (): void => {
      if (!isEditable.value) { return }
      isEditing.value = true
      editedBody.value = comment.value?.body || ''
    }

    if (comment.value?.isNew) { editComment() }

    const deleteComment = (): void => {
      if (!isEditable.value) { return }
      commentStore.deleteComment(props.commentId)
    }

    const deleteCommentThread = (): void => {
      if (!isEditable.value) { return }
      if (!comment.value?.comment_thread_id) { return }
      commentStore.deleteCommentThread(comment.value.comment_thread_id)
    }

    const resolveCommentThread = (): void => {
      if (!isEditable.value) { return }
      if (!comment.value?.comment_thread_id) { return }
      commentStore.resolveCommentThread(comment.value.comment_thread_id)
    }

    const cancelEdit = (): void => {
      if (comment.value?.isNew) {
        commentStore.removeComment(comment.value.id)
      }
      editedBody.value = ''
      isEditing.value = false
    }

    const submitEdit = (): void => {
      if (!isEditable.value) { return }
      commentStore.updateComment(props.commentId, editedBody.value)
      isEditing.value = false
    }

    const popoverClass = computed<string>(
      () => `comment-item__overlay ${props.isResolvable ? 'comment-item__overlay--resolve' : ''}`
    )

    return {
      author,
      cancelEdit,
      canDeleteComment,
      canEditComment,
      comment,
      commentBodyHtml,
      deleteComment,
      deleteCommentThread,
      editComment,
      editedBody,
      humanizedTime,
      isEditable,
      isEditing,
      isNew,
      isOverlayOpen,
      popoverClass,
      resolveCommentThread,
      submitEdit,
      toggleOverlay
    }
  }
})

</script>

<style lang="scss" scoped>
.comment-item {
  @include col;
  width: 100%;
  padding: 10px 15px;
  border-bottom: 1px solid $colorSecondaryLight2;
}

.comment-item__header {
  width: 100%;
  @include row;
  align-items: center;
  margin-bottom: 10px;
}

.comment-item__profile {
  flex: 1 1 auto;
  width: auto;
}

.comment-item__datetime {
  @include typography(sm, default, bold);
  color: $colorSecondaryLight;
}

.comment-item__more {
  width: 10px;
  height: 12px;
  padding: 5px 0;
  margin-left: 10px;
  background-image: url('/static/imgs/more-gray-icon.svg');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  cursor: pointer;

  &:hover {
    opacity: .5;
  }
  &:active {
    opacity: .7;
  }
}

.comment-item__resolve {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    opacity: .5;
  }
  &:active {
    opacity: .7;
  }
}

.comment-item__body {
  position: relative;
  width: 100%;
  @include typography(md, default);
  line-height: 20px;
  color: $colorBlack;
  border: none;
  outline: none;
}

.comment-item__non-edit {
  height: auto;
  word-break: break-word;
  white-space: pre-line;
  margin: 5px 0 10px 0;
}

.comment-item__edit {
  display: none;
}

.comment-item__body--editing {
  .comment-item__non-edit {
    display: none;
    height: 0;
    margin: 0;
  }
  .comment-item__edit {
    display: block;
  }
}

.comment-item__edit-actions {
  @include row--center;
  justify-content: flex-end;

  button {
    margin-left: 5px;
  }
}

.comment-item__edit__new-actions {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 20px;
  margin-top: 10px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.comment-item__overlay.tooltip.popover {
  background: $colorWhite;
  border-radius: $border-radius-default;
  padding: 8px 0;
  box-shadow: 0px 15px 30px rgba(20, 5, 60, 0.2);

  .popover-inner {
    background: $colorWhite;
    padding: 0;
  }

  &[x-placement^="right"] {
    margin-left: 20px;
    margin-top: 35px;
  }

  .comment-item__overlay__item {
    @include typography(md, default);
    color: $colorSecondaryDark;
    background: $colorWhite;
    padding: 8px 20px 8px 12px;
    width: 100%;
    text-align: left;
    @include noSelect;
    display: block;
    cursor: pointer;

    &:disabled {
      color: $colorSecondaryLight;
    }

    &:hover:not(:disabled),
    &:active:not(:disabled) {
      background: $colorPrimaryLight2;
    }

    &:active:not(:disabled) {
      opacity: .7;
    }

    &--disabled {
      color: $colorSecondaryLight;
    }
  }

  &.comment-item__overlay--resolve {
    &[x-placement^="right"] {
      margin-left: 45px;
      margin-top: 70px;
    }
  }
}
</style>
