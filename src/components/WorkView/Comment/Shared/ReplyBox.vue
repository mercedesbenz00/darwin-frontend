<template>
  <div
    v-esc="onCancel"
    v-enter="onPost"
    class="reply-box"
  >
    <comment-profile
      v-if="showAuthor"
      :author="author"
      class="reply-box__profile"
    />
    <comment-edit-box
      v-model="body"
      placeholder="Reply"
      class="reply-box-textarea"
      :focus="hasFocus"
      @click-outside="unfocus"
      @enter="onPost"
      @cancel="onCancel"
      @click.native="focus"
    />
    <div
      v-if="hasFocus"
      class="reply-box__actions"
    >
      <secondary-button
        size="small"
        @click.stop.prevent="onCancel"
      >
        Cancel
      </secondary-button>
      <positive-button
        :disabled="!body"
        size="small"
        @click.stop.prevent="onPost"
      >
        Post
      </positive-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { ReplyBoxProps } from '@/components/WorkView/Comment/types'
import { UserPayload } from '@/store/types'

import CommentEditBox from './CommentEditBox.vue'
import CommentProfile from './CommentProfile.vue'

@Component({ name: 'reply-box', components: { CommentEditBox, CommentProfile } })
export default class ReplyBox extends Vue implements ReplyBoxProps {
  @Prop({ required: true })
  author!: UserPayload

  /**
   * Tells the component to always render the author (current user) icon
   *
   * Can be used to force rendering of author when creating a new comment thread,
   * in which case, there would be nothing else to show otherwise
   */
  @Prop({ required: false, default: false })
  stickAuthor!: boolean

  body: string = ''

  hasFocus: boolean = false

  get showAuthor () {
    return this.stickAuthor || this.hasFocus
  }

  mounted () {
    this.preventNextFocusChange()
    this.focus()
  }

  focus () {
    this.$nextTick(() => { this.hasFocus = true })
  }

  /**
   * Unfocus honors the `focusChangePrevented` flag and skips unfocusing if it is set
   *
   * However, only a single call is honored this way and the flag is unset for subsequent calls.
   */
  unfocus () {
    if (this.focusChangePrevented) { return this.allowFocusChange() }
    this.$nextTick(() => { this.hasFocus = false })
  }

  /**
   * Component is mounted when the comment icon is clicked.
   *
   * This ought to focus the textbox, showing the post and cancel buttons, but it also
   * triggers the click-outside handler on the textbox, causing it to unfocus.
   *
   * Due to that, we need to prevent the next focus change, so it stays focused.
   *
   * This flag indicates that the next focus change should be prevented.
   */
  focusChangePrevented: boolean = false

  private allowFocusChange () {
    this.focusChangePrevented = false
  }

  private preventNextFocusChange () {
    this.focusChangePrevented = true
  }

  onPost () {
    if (!this.body) { return }
    this.$emit('post', this.body)
    this.body = ''
    this.focusChangePrevented = false
    this.unfocus()
  }

  onCancel () {
    this.body = ''
    this.$emit('cancel')
    this.focusChangePrevented = false
    this.unfocus()
  }
}
</script>

<style lang="scss" scoped>
.reply-box {
  flex: 1;
  @include col;
  width: 100%;
  padding: 10px 15px;
}

.reply-box__profile {
  margin-bottom: 10px;
  display: flex;
}

.reply-box-textarea {
  flex: 1;
  width: 100%;
  cursor: default;
}

.reply-box__actions {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 20px;
  margin-top: 10px;
}
</style>
