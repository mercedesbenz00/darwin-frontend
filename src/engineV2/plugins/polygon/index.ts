import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { PolygonRenderer } from './PolygonRenderer'
import { measures } from './measures'
import { serializer } from './serializer'
import { tool } from './tool'
import { POLYGON_ANNOTATION_TYPE } from './types'

const polygon: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(POLYGON_ANNOTATION_TYPE, new PolygonRenderer(context.editor))
    context.registerMeasureOverlayer(POLYGON_ANNOTATION_TYPE, measures)
    context.registerSerializer(POLYGON_ANNOTATION_TYPE, serializer)
    context.registerTool('polygon_tool', tool)
  },

  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(POLYGON_ANNOTATION_TYPE)
    context.unregisterMeasureOverlayer(POLYGON_ANNOTATION_TYPE)
    context.unregisterSerializer(POLYGON_ANNOTATION_TYPE)
    context.unregisterTool('polygon_tool')

    // TODO: deregister the tool and annotation type
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default polygon
