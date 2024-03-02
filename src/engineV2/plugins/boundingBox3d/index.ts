import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { BoundingBox3DRenderer } from './BoundingBox3DRenderer'
import { annotationType } from './consts'
import { serializer } from './serializer'
import { tool } from './tool'

const boundingBox3D: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(annotationType, new BoundingBox3DRenderer(context.editor))
    context.registerSerializer(annotationType, serializer)
    context.registerTool('bounding_box_3d_tool', tool)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(annotationType)
    context.unregisterSerializer(annotationType)
    context.unregisterTool('bounding_box_3d_tool')

    for (const handle of context.handles) {
      handle.release()
    }
    // TODO: deregister the tool and annotation type
  }
}

export default boundingBox3D
