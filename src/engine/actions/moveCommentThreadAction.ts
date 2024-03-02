import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers/actionManager'
import { CommentThread } from '@/engine/models'

export const moveCommentThreadAction = (
  editor: Editor,
  commentThread: CommentThread
): Action => {
  return {
    async do (): Promise<boolean> {
      await editor
        .activeView
        .commentManager
        .updateCommentThread(commentThread)
      editor
        .activeView
        .annotationsLayer
        .changed()
      return true
    },
    async undo (): Promise<boolean> {
      await editor
        .activeView
        .commentManager
        .updateCommentThread(commentThread)
      editor
        .activeView
        .annotationsLayer
        .changed()
      return true
    }
  }
}
