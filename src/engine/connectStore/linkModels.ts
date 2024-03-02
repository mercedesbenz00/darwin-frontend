import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { RootState } from '@/store/types'

export const linkModels = (store: Store<RootState>, editor: Editor): Function => {
  if (editor.autoAnnotateModels.length > 0) {
    editor.activeView.onModelsChangedCallbacks.call(editor.autoAnnotateModels)
    editor.setPreselectedAutoAnnotateModel()
  }

  const modelMutations = ['workview/SET_AUTO_ANNOTATE_MODELS']

  return store.subscribe(mutation => {
    if (modelMutations.includes(mutation.type)) {
      editor.activeView.onModelsChangedCallbacks.call(editor.autoAnnotateModels)
      editor.setPreselectedAutoAnnotateModel()
    }
  })
}
