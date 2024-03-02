import { computed, watch } from 'vue'
import { Store } from 'vuex'

import { useEditorLayout, useActiveView } from '@/composables/useEditorV2'
import {
  EditorCommentThread,
  getBoundingBox,
  payloadToEditorThread
} from '@/engineV2/commentHelpers'
import { Editor } from '@/engineV2/editor'
import { CommentManager } from '@/engineV2/managers/CommentManager'
import { useCommentStore } from '@/pinia/useCommentStore'
import { RootState } from '@/store/types'

export const useLinkComments = (store: Store<RootState>, editor: Editor): Function => {
  const commentStore = useCommentStore()

  const handleThreadCreate = (thread: EditorCommentThread): void => {
    if (!editor.itemManager.currentItem?.id) { return }

    commentStore.addNewCommentThread(editor.itemManager.currentItem.id, {
      authorId: store.state.user.profile!.id,
      boundingBox: getBoundingBox(thread),
      sectionIndex: thread.sectionIndex,
      slotName: thread.slotName,
      threadId: thread.id
    })
  }

  const handleThreadUpdating = (thread: EditorCommentThread): void => {
    // we update the store thread here to keep things fast.
    // doing it as a store action slows it down too much
    const storeThread = commentStore.threadsById[thread.id]
    if (!storeThread) { return }
    storeThread.bounding_box = getBoundingBox(thread)
  }

  const handleThreadUpdated = (thread: EditorCommentThread): void => {
    commentStore.saveCommentThread(thread.id)
  }

  const handleThreadOpen = (threadId: string): void => commentStore.setActiveThreadId(threadId)
  const handleThreadClosed = (): void => commentStore.unsetActiveThreadId()

  const layout = useEditorLayout()

  const threadsForCurrentItem = computed<EditorCommentThread[]>(() => {
    const itemId = store.state.workview.selectedDatasetItemV2Id
    if (!itemId) { return [] }

    return commentStore.threads
      .filter(t => t.dataset_item_id === itemId && !t.resolved)
      .map<EditorCommentThread>(payloadToEditorThread)
  })

  const setCommentThreads = (): void => {
    layout.value.viewsList.forEach(view => {
      view.commentManager?.setCommentThreads(
        threadsForCurrentItem.value.filter(t => t.slotName === view.fileManager.slotName)
      )
    })
  }

  const unwatchLayout = watch(() => layout.value, () => setCommentThreads(), { immediate: true })

  const activeView = useActiveView()

  const unwatchActiveView = watch(() => activeView.value, (newView, oldView) => {
    oldView?.commentManager.off(CommentManager.THREAD_CREATED, handleThreadCreate)
    newView?.commentManager.on(CommentManager.THREAD_CREATED, handleThreadCreate)

    oldView?.commentManager.off(CommentManager.THREAD_UPDATING, handleThreadUpdating)
    newView?.commentManager.on(CommentManager.THREAD_UPDATING, handleThreadUpdating)

    oldView?.commentManager.off(CommentManager.THREAD_UPDATED, handleThreadUpdated)
    newView?.commentManager.on(CommentManager.THREAD_UPDATED, handleThreadUpdated)

    oldView?.commentManager.off(CommentManager.THREAD_OPENED, handleThreadOpen)
    newView?.commentManager.on(CommentManager.THREAD_OPENED, handleThreadOpen)

    oldView?.commentManager.off(CommentManager.THREAD_CLOSED, handleThreadClosed)
    newView?.commentManager.on(CommentManager.THREAD_CLOSED, handleThreadClosed)
  })

  const unwatchThreads = watch(
    () => threadsForCurrentItem.value,
    () => setCommentThreads(),
    { immediate: true }
  )

  return (): void => {
    unwatchLayout()
    unwatchActiveView()
    unwatchThreads()
  }
}
