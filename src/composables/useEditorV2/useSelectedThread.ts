import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { CommentManager } from '@/engineV2/managers'
import { View } from '@/engineV2/views'
import { V2CommentThreadPayload } from '@/store/types'

export const useSelectedThread = (view: Ref<View>): Ref<V2CommentThreadPayload | null> => {
  const thread = ref<V2CommentThreadPayload | null>(view.value.commentManager.selectedThread)

  const handleThreadSelected = (): void => {
    thread.value = view.value.commentManager.selectedThread
  }
  const handleThreadDeselected = (): void => { thread.value = null }

  watch(() => view.value, (newView, oldView) => {
    oldView?.commentManager.off(CommentManager.THREAD_SELECTED, handleThreadSelected)
    oldView?.commentManager.off(CommentManager.THREAD_DESELECTED, handleThreadDeselected)

    handleThreadSelected()

    newView?.commentManager.on(CommentManager.THREAD_SELECTED, handleThreadSelected)
    newView?.commentManager.on(CommentManager.THREAD_DESELECTED, handleThreadDeselected)
  }, { immediate: true })

  onBeforeUnmount(() => {
    view.value.commentManager.off(CommentManager.THREAD_SELECTED, handleThreadSelected)
    view.value.commentManager.off(CommentManager.THREAD_DESELECTED, handleThreadDeselected)
  })

  return thread as Ref<V2CommentThreadPayload | null>
}
