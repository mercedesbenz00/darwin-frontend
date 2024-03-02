import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { Editor } from '@/engineV2/editor'
import { Action } from '@/engineV2/managers/actionManager'

export const moveCommentThreadVertexAction =
  (editor: Editor, thread: EditorCommentThread): Action => {
    return {
      async do (): Promise<boolean> {
        await editor.activeView.commentManager.updateThread(thread)
        return true
      },
      async undo (): Promise<boolean> {
        await editor.activeView.commentManager.updateThread(thread)
        return true
      }
    }
  }
