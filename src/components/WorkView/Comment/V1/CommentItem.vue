<template>
  <div class="comment-item">
    <div class="comment-item__header">
      <comment-profile
        :author="author"
        :comment="comment"
        class="comment-item__profile"
      />
      <template v-if="isEditing">
        <div class="comment-item__edit-actions">
          <secondary-button
            size="small"
            @click="onEditReset"
          >
            Cancel
          </secondary-button>
          <positive-button
            :disabled="!editingBody || editingBody === comment.body"
            size="small"
            @click="onEditSave"
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
          :open="overlayOpen"
          placement="right"
          :popover-class="`comment-item__overlay ${
            showResolve ? 'comment-item__overlay--resolve' : ''
          }`"
        >
          <div
            class="comment-item__more"
            @click="showOverlay"
          />
          <template slot="popover">
            <button
              class="comment-item__overlay__item"
              :disabled="!(isEditable && canEditComment)"
              @click="editComment"
            >
              Edit Comment
            </button>
            <button
              class="comment-item__overlay__item"
              :disabled="!(isEditable && canDeleteComment)"
              @click="deleteComment"
            >
              Delete Comment
            </button>
            <button
              v-if="showDeleteCommentThread"
              class="comment-item__overlay__item"
              :disabled="!isEditable"
              @click="deleteCommentThread"
            >
              Delete Thread
            </button>
          </template>
        </v-popover>
        <div
          v-if="showResolve"
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
          v-model="editingBody"
          placeholder="Reply"
          class="comment-item__edit-textarea"
          :focus="isEditing"
          @enter="onEditSave"
          @cancel="onEditReset"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import CommentEditBox from '@/components/WorkView/Comment/Shared/CommentEditBox.vue'
import CommentProfile from '@/components/WorkView/Comment/Shared/CommentProfile.vue'
import { Comment } from '@/engine/models'
import { MembershipPayload, TeamPayload, UserPayload } from '@/store/types'
import { commentToHtml, getAgoString } from '@/utils'

@Component({ name: 'comment-item', components: { CommentEditBox, CommentProfile } })
export default class CommentItem extends Vue {
  @Prop({ required: true })
  comment!: Comment

  @Prop({ required: true, type: Boolean })
  showResolve!: boolean

  @Prop({ required: true, type: Boolean })
  showDeleteCommentThread!: boolean

  @Prop({ required: true })
  team!: TeamPayload

  @Getter('findMembershipByTeamIdUserId', { namespace: 'team' })
  getAuthor!: (teamId: number, userId: number) => MembershipPayload | null

  @State(state => state.user.profile)
  currentUser!: UserPayload

  overlayOpen: boolean = false
  isEditing: boolean = false
  editingBody: string = ''

  /**
   * Returns comment author data depending on several factors
   *
   * - if the current user is the comment author, returns current user,
   *   to avoid unnecessarily loading it
   * - if the current user has access to team members, returns the actual comment author
   * - if the current user does not have access to team members returns the team as an
   *   author. This can happen when viewing an open datase
   */
  get author () {
    if (this.currentUser && this.currentUser.id === this.comment.authorId) {
      return this.currentUser
    }

    const author = this.getAuthor(this.team.id, this.comment.authorId)
    if (author) { return author }

    return {
      id: this.team.id,
      image: this.team.image,
      first_name: this.team.name,
      last_name: ''
    }
  }

  get canEditComment () {
    const commentResource = { author_id: this.comment.authorId }
    return (
      this.$can('update_comment', { subject: 'comment', resource: commentResource }) ||
      this.$can('update_comment')
    )
  }

  get canDeleteComment () {
    const commentResource = { author_id: this.comment.authorId }
    return (
      this.$can('delete_comment', { subject: 'comment', resource: commentResource }) ||
      this.$can('delete_comment')
    )
  }

  get commentBodyHtml () {
    return commentToHtml(this.comment.body)
  }

  get humanizedTime () {
    return getAgoString(this.comment.insertedAt)
  }

  get isEditable () {
    return this.currentUser && this.comment.authorId === this.currentUser.id
  }

  showOverlay () {
    this.overlayOpen = !this.overlayOpen
  }

  editComment () {
    if (!this.isEditable) { return }
    this.overlayOpen = false
    this.editingBody = this.comment.body
    this.isEditing = true
  }

  deleteComment () {
    if (!this.isEditable) { return }
    this.$emit('delete-comment', this.comment)
    this.overlayOpen = false
  }

  deleteCommentThread () {
    if (!this.isEditable) { return }
    this.$emit('delete-comment-thread', this.comment)
    this.overlayOpen = false
  }

  resolveCommentThread () {
    this.$emit('resolve-comment-thread')
  }

  onEditReset () {
    this.editingBody = ''
    this.isEditing = false
  }

  onEditSave () {
    this.$emit('update-comment', {
      id: this.comment.id,
      body: this.editingBody
    })
    this.onEditReset()
  }
}
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
