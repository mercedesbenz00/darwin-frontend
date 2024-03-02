import { Editor } from '@/engineV2/editor'
import { ModelType } from '@/store/types'

/**
 * Checks whether or not the preselected model is of type `auto_annotate`.
 */
export const isPreselectedModelAutoAnnotate = (editor: Editor): boolean => {
  const { preselectedAutoAnnotateModel: preselectedModel } = editor.autoAnnotateManager
  if (!preselectedModel) { return false }

  const { trainedModels } = editor.store.state.neuralModel
  const trainedModel = trainedModels.find(tm => tm.id === preselectedModel.trained_model_id)
  // If no trained model is found, we should assume that the preselected model
  // is in fact of AutoAnnotation type
  if (!trainedModel) { return true }

  return trainedModel.model_template.type === ModelType.AutoAnnotation
}
