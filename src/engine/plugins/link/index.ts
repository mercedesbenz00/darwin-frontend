import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { LinkRenderer } from './renderer'
import { serializer } from './serializer'
import { tool } from './tool'
import { LINK_ANNOTATION_TYPE } from './types'

const link: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(LINK_ANNOTATION_TYPE, new LinkRenderer(context.editor))
    context.registerSerializer(LINK_ANNOTATION_TYPE, serializer)
    context.registerTool('link_tool', tool)
  },

  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(LINK_ANNOTATION_TYPE)
    context.unregisterSerializer(LINK_ANNOTATION_TYPE)
    context.unregisterTool('link_tool')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default link
