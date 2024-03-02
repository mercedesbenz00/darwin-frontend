import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers/actionManager'
import { CommentThread } from '@/engine/models'

export const updateCommentThreadAction = (
  editor: Editor,
  commentThread: CommentThread,
  existingCommentThread: CommentThread
): Action => ({
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
      .updateCommentThread(existingCommentThread)
    editor
      .activeView
      .annotationsLayer
      .changed()
    return true
  }
})
