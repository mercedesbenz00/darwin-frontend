<template>
  <div class="comment-icons">
    <comment-thread-icon
      v-for="commentThread in filteredCommentThreads"
      :key="commentThread.id"
      :comment-thread="commentThread"
      :view="view"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CommentThread, View } from '@/engine/models'
import { RootState } from '@/store/types'

import CommentThreadIcon from './CommentThreadIcon.vue'

@Component({ name: 'comment-icons', components: { CommentThreadIcon } })
export default class CommentIcons extends Vue {
  @State((state: RootState) => state.comment.commentThreads.filter(t => !t.resolved))
  commentThreads!: CommentThread[]

  @Prop({ required: true, type: Object as () => View })
  view!: View

  /**
   * Load frame-specific comments for videos
   */
  get filteredCommentThreads () {
    const { loadedVideo } = this.view
    if (!loadedVideo) {
      return this.commentThreads
    }

    return this.commentThreads.filter(commentThread =>
      commentThread.frameIndex === this.view.currentFrameIndex
    )
  }
}
</script>

<style lang="scss" scoped>
.comment-icons {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
