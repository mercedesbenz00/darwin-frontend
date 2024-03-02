import { Editor } from '@/engineV2/editor'
import { ClassMapping } from '@/store/modules/workview/types'
import { RunningSessionPayload, ModelType } from '@/utils/wind/types'

export class AutoAnnotateManager {
  private editor: Editor

  constructor (editor: Editor) {
    this.editor = editor
  }

  get autoAnnotateModels (): RunningSessionPayload[] {
    return this.editor.store.state.workview.autoAnnotateModels
  }

  public get preselectedAutoAnnotateModel (): RunningSessionPayload | null {
    const { preselectedModelId: id } = this.editor.store.state.workview
    const { autoAnnotateModels } = this
    return autoAnnotateModels.find(m => m.id === id) || null
  }

  public get clickerEpsilon (): number {
    return this.editor.store.state.workview.clickerEpsilon
  }

  /**
   * Automatically preselects a neural model if one isn't already selected.
   *
   * If a model of type `ModelType.AutoAnnotation` exists, select that, otherwise
   * select the first model among the available ones.
   */
  setPreselectedAutoAnnotateModel (): void {
    const { preselectedModelId } = this.editor.store.state.workview
    if (preselectedModelId) { return }

    const { autoAnnotateModels } = this
    if (autoAnnotateModels.length === 0) { return }

    const { trainedModels } = this.editor.store.state.neuralModel
    const autoAnnotate = autoAnnotateModels.find(autoAnnotateModel => {
      const trainedModel = trainedModels.find(tm => tm.id === autoAnnotateModel.trained_model_id)
      if (!trainedModel) { return false }
      return trainedModel.model_template.type === ModelType.AutoAnnotation
    })

    const preselectedModel = autoAnnotate || autoAnnotateModels[0]
    this.editor.store.commit('workview/SET_CURRENT_TOOL_PRESELECTED_MODEL_ID', preselectedModel.id)
  }

  get preselectedModelClassMapping (): ClassMapping {
    const { preselectedAutoAnnotateModel } = this
    if (!preselectedAutoAnnotateModel) { return [] }

    const autoAnnotateClassMapping = this.editor.store.state.workview.classMapping
    if (!(preselectedAutoAnnotateModel.id in autoAnnotateClassMapping)) { return [] }

    return autoAnnotateClassMapping[preselectedAutoAnnotateModel.id]
  }
}
