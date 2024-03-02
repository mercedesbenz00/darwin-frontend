import { Store } from 'vuex'

import { Editor } from '@/engineV2/editor'
import { ModelType, RootState } from '@/store/types'

export const linkModels = (store: Store<RootState>, editor: Editor): Function => {
  const autoAnnotateModels = store.state.workview.autoAnnotateModels

  const setPreselectedAutoAnnotateModel = (): void => {
    const { preselectedModelId } = store.state.workview
    if (preselectedModelId) { return }

    if (autoAnnotateModels.length === 0) { return }

    const { trainedModels } = store.state.neuralModel
    const autoAnnotate = autoAnnotateModels.find(autoAnnotateModel => {
      const trainedModel = trainedModels.find(tm => tm.id === autoAnnotateModel.trained_model_id)
      if (!trainedModel) { return false }
      return trainedModel.model_template.type === ModelType.AutoAnnotation
    })

    const preselectedModel = autoAnnotate || autoAnnotateModels[0]
    store.commit('workview/SET_CURRENT_TOOL_PRESELECTED_MODEL_ID', preselectedModel.id)
  }

  if (autoAnnotateModels.length > 0) {
    // TODO: Remove on models changed callbacks
    editor.activeView.onModelsChangedCallbacks.call(autoAnnotateModels)
    setPreselectedAutoAnnotateModel()
  }

  const modelMutations = ['workview/SET_AUTO_ANNOTATE_MODELS']

  return store.subscribe(mutation => {
    if (modelMutations.includes(mutation.type)) {
      editor.activeView.onModelsChangedCallbacks.call(autoAnnotateModels)
      setPreselectedAutoAnnotateModel()
    }
  })
}
