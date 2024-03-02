import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { KeypointRenderer } from './KeypointRenderer'
import { annotationType } from './consts'
import { serializer } from './serializer'
import { tool } from './tool'

const keypoint: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(annotationType, new KeypointRenderer(context.editor))
    context.registerSerializer(annotationType, serializer)
    context.registerTool('keypoint_tool', tool)
  },

  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(annotationType)
    context.unregisterSerializer(annotationType)
    context.unregisterTool('keypoint_tool')

    // TODO: deregister the tool and annotation type
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default keypoint
