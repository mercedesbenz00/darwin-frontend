import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { CommentManager } from '@/engineV2/managers'
import { View } from '@/engineV2/views'
import { V2CommentThreadPayload } from '@/store/types/V2CommentThreadPayload'

import { useCurrentFrameIndex } from './useCurrentFrameIndex'

export const useCurrentFrameThreads = (
  view: Ref<View | null>
): Ref<V2CommentThreadPayload[] | EditorCommentThread[]> => {
  const threads = ref<V2CommentThreadPayload[] | EditorCommentThread[]>([])

  const currentFrameIndex = useCurrentFrameIndex(view)

  const handleThreadsChanged = (): void => {
    if (!view.value) {
      threads.value = []
      return
    }
    threads.value = view.value.commentManager.frameThreads
  }

  watch(() => currentFrameIndex.value, () => {
    handleThreadsChanged()
  })

  watch(() => view.value, (newView, oldView) => {
    oldView?.commentManager.off(CommentManager.THREADS_CHANGED, handleThreadsChanged)

    handleThreadsChanged()

    newView?.commentManager.on(CommentManager.THREADS_CHANGED, handleThreadsChanged)
  }, { immediate: true })

  onBeforeUnmount(() => {
    view.value?.commentManager.off(CommentManager.THREADS_CHANGED, handleThreadsChanged)
  })

  return threads as Ref<V2CommentThreadPayload[] | EditorCommentThread[]>
}
