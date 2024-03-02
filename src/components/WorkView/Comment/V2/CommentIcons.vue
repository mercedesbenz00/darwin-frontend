<template>
  <div class="comment-icons">
    <comment-thread-icon
      v-for="thread in threads"
      :key="thread.id"
      :thread-id="thread.id"
      :view-id="viewId"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useCurrentFrameThreads, useView } from '@/composables/useEditorV2'

import CommentThreadIcon from './CommentThreadIcon.vue'

/**
 * Renders a list of icon components, one per comment thread, on top of the canvas.
 *
 * Does not deal with positioning. Each individual icon is in charge of their own.
 */
export default defineComponent({
  name: 'CommentIcons',
  components: { CommentThreadIcon },
  props: {
    viewId: { type: String, required: true }
  },
  setup (props) {
    const view = useView(props.viewId)
    const threads = useCurrentFrameThreads(view)

    return { threads }
  }
})
</script>

<style lang="scss" scoped>
.comment-icons {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
