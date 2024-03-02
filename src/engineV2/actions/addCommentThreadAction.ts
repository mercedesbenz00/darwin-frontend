import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { Editor } from '@/engineV2/editor'
import { Action } from '@/engineV2/managers/actionManager'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'

export const addCommentThreadAction = (
  editor: Editor,
  thread: EditorCommentThread
): Action => ({
  async do (): Promise<boolean> {
    await editor.activeView.commentManager.addCommentThread(thread)
    if (FeatureFlagsManager.isOffLayerV2) {
      editor.activeView.annotationsLayer.changed()
    }
    return true
  },
  async undo (): Promise<boolean> {
    await editor.activeView.commentManager.removeCommentThread(thread)
    if (FeatureFlagsManager.isOffLayerV2) {
      editor.activeView.annotationsLayer.changed()
    }
    return true
  }
})
