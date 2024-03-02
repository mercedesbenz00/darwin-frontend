import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { TableRenderer } from './renderer'
import { serializer } from './serializer'
import { tool } from './tool'
import { TABLE_ANNOTATION_TYPE } from './types'

const tablePlugin: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(TABLE_ANNOTATION_TYPE, new TableRenderer(context.editor))
    context.registerSerializer(TABLE_ANNOTATION_TYPE, serializer)
    context.registerTool('table_tool', tool)
  },

  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(TABLE_ANNOTATION_TYPE)
    context.unregisterSerializer(TABLE_ANNOTATION_TYPE)

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default tablePlugin
