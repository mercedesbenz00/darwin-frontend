import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers/actionManager'
import { CommentThread } from '@/engine/models'

export const addCommentThreadAction = (
  editor: Editor,
  commentThread: CommentThread
): Action => ({
  async do (): Promise<boolean> {
    await editor
      .activeView
      .commentManager
      .addNewCommentThread(commentThread)
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
      .removeCommentThread(commentThread)
    editor
      .activeView
      .annotationsLayer
      .changed()
    return true
  }
})
