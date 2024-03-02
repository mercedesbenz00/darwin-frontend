import { SubAnnotationTool } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation } from '@/engineV2/models'
import {
  setupPrimaryButtonPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { PluginContext } from '@/engineV2/types'

import { ClickerTool } from './ClickerTool'
import { isPreselectedModelAutoAnnotate, retrieveAutoAnnotateData } from './utils'

const resolveClickerTool = (context: PluginContext): ClickerTool | undefined => {
  const { currentTool } = context.editor.toolManager
  if (!currentTool) { return }

  if (currentTool.name !== 'clicker_tool') { return }

  return currentTool.tool as ClickerTool
}

export const clickerSubTool: SubAnnotationTool = {
  masterAnnotation: null,
  selectMasterAnnotation (context: PluginContext, annotation: Annotation) {
    this.masterAnnotation = annotation

    const autoAnnotateData = retrieveAutoAnnotateData(annotation.id, context.editor.activeView)
    if (!autoAnnotateData) { return }

    context.editor.toolManager.activateTool('clicker_tool')
    context.editor.callCommand('clicker_tool.init', annotation, autoAnnotateData)

    const tool = resolveClickerTool(context)
    if (!tool) { return }

    if (isPreselectedModelAutoAnnotate(context.editor)) { return }

    const { trainedModels } = context.editor.store.state.neuralModel
    const trainedAutoAnnotateIds = trainedModels.map(tm => tm.id)

    const autoAnnotateModel = tool.models.find(m =>
      trainedAutoAnnotateIds.includes(m.trained_model_id)
    )

    if (autoAnnotateModel) {
      context.editor.store.commit(
        'workview/SET_CURRENT_TOOL_PRESELECTED_MODEL_ID',
        autoAnnotateModel.id
      )
    }
  },

  activate (context: PluginContext) {
    setupPrimaryButtonPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)
    if (FeatureFlagsManager.isOffLayerV2) {
      context.editor.activeView.annotationsLayer.changed()
    }
  },

  deactivate (context: PluginContext) {
    if (FeatureFlagsManager.isOffLayerV2) {
      context.editor.activeView.annotationsLayer.changed()
    }
    context.editor.toolManager.activatePreviousToolEntry()
  },

  reset () {}
}
