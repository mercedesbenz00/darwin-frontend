import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers/actionManager'
import { CommentThread } from '@/engine/models'

export const moveCommentThreadVertexAction = (
  editor: Editor,
  commentThread: CommentThread
): Action => {
  return {
    async do (): Promise<boolean> {
      await editor
        .activeView
        .commentManager
        .updateCommentThread(commentThread)
      return true
    },
    async undo (): Promise<boolean> {
      await editor
        .activeView
        .commentManager
        .updateCommentThread(commentThread)
      return true
    }
  }
}
