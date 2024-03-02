import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { CommentManager } from '@/engineV2/managers'
import { View } from '@/engineV2/views'

export const useThreads = (view: Ref<View>): Ref<EditorCommentThread[]> => {
  const threads = ref<EditorCommentThread[]>(view.value.commentManager.threads)

  const handleThreadsChanged = (): void => {
    threads.value = view.value.commentManager.threads
  }

  watch(() => view.value, (newView, oldView) => {
    oldView?.commentManager.off(CommentManager.THREADS_CHANGED, handleThreadsChanged)

    handleThreadsChanged()

    newView?.commentManager.on(CommentManager.THREADS_CHANGED, handleThreadsChanged)
  }, { immediate: true })

  onBeforeUnmount(() => {
    view.value.commentManager.off(CommentManager.THREADS_CHANGED, handleThreadsChanged)
  })

  return threads as Ref<EditorCommentThread[]>
}
