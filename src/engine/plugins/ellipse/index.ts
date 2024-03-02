import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { EllipseRenderer } from './EllipseRenderer'
import { measures } from './measures'
import { serializer } from './serializer'
import { tool } from './tool'
import { ELLIPSE_ANNOTATION_TYPE } from './types'

const ellipse: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(ELLIPSE_ANNOTATION_TYPE, new EllipseRenderer(context.editor))
    context.registerMeasureOverlayer(ELLIPSE_ANNOTATION_TYPE, measures)
    context.registerSerializer(ELLIPSE_ANNOTATION_TYPE, serializer)
    context.registerTool('ellipse_tool', tool)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(ELLIPSE_ANNOTATION_TYPE)
    context.unregisterMeasureOverlayer(ELLIPSE_ANNOTATION_TYPE)
    context.unregisterSerializer(ELLIPSE_ANNOTATION_TYPE)
    context.unregisterTool('ellipse_tool')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default ellipse
