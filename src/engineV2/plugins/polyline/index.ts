import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { measures } from './measures'
import { PolylineRenderer } from './renderer'
import { serializer } from './serializer'
import { tool } from './tool'
import { POLYLINE_ANNOTATION_TYPE } from './types'

const polyline: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(
      POLYLINE_ANNOTATION_TYPE,
      new PolylineRenderer(context.editor)
    )
    context.registerMeasureOverlayer(POLYLINE_ANNOTATION_TYPE, measures)
    context.registerSerializer(POLYLINE_ANNOTATION_TYPE, serializer)
    context.registerTool('polyline_tool', tool)
  },

  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(POLYLINE_ANNOTATION_TYPE)
    context.unregisterMeasureOverlayer(POLYLINE_ANNOTATION_TYPE)
    context.unregisterSerializer(POLYLINE_ANNOTATION_TYPE)
    context.unregisterTool('polyline_tool')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default polyline
