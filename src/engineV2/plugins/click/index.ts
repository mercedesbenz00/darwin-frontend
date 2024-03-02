import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { ToolContext } from '@/engineV2/managers/toolManager'
import { isVideoSubAnnotations } from '@/engineV2/models'
import { PluginContext } from '@/engineV2/types'

import { ClickerTool } from './ClickerTool'
import HeaderTools from './HeaderTools.vue'
import Spinner from './Spinner.vue'
import { HEADER_COMPONENT, SPINNER_COMPONENT } from './consts'
import { serializer } from './serializer'
import { clickerSubTool } from './subTool'
import { retrieveAutoAnnotateData } from './utils'

const maybeRegisterTool = (context: PluginContext): void => {
  const { autoAnnotateModels } = context.editor.autoAnnotateManager
  if (autoAnnotateModels.length > 0) {
    context.registerTool('clicker_tool', new ClickerTool(autoAnnotateModels))
  }
}

const resume = (context: ToolContext): void => {
  const { selectedAnnotation } = context.editor.activeView.annotationManager
  if (!selectedAnnotation) { return }
  if (isVideoSubAnnotations(selectedAnnotation.subAnnotations)) { return }

  const autoAnnotateData = retrieveAutoAnnotateData(
    selectedAnnotation.id,
    context.editor.activeView
  )
  if (!autoAnnotateData) { return }

  context.editor.toolManager.activateTool('clicker_tool')
  context.editor.callCommand('clicker_tool.init', selectedAnnotation, autoAnnotateData)
}

const clicker: EnginePlugin = {
  activate (context: PluginContext) {
    maybeRegisterTool(context)
    context.editor.onModelsChanged(() => maybeRegisterTool(context))
    context.registerSerializer('auto_annotate', serializer)
    context.registerTool('auto_annotate_tool', clickerSubTool)

    context.registerComponent(HEADER_COMPONENT, HeaderTools)
    context.registerComponent(SPINNER_COMPONENT, Spinner)

    context.registerCommand('clicker_tool.resume', () => resume(context))
  },

  deactivate (context: PluginContext) {
    context.unregisterSerializer('auto_annotate')
    context.unregisterTool('auto_annotate_tool')
    context.unregisterCommand('clicker_tool.resume')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default clicker
