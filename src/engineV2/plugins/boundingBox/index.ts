import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { BoundingBoxRenderer } from './BoundingBoxRenderer'
import { measures } from './measures'
import { serializer } from './serializer'
import { tool } from './tool'
import { BOUNDING_BOX_ANNOTATION_TYPE } from './types'

const boundingBox: EnginePlugin = {
  activate (context: PluginContext) {
    const renderer = new BoundingBoxRenderer(context.editor)
    context.registerAnnotationRenderer(BOUNDING_BOX_ANNOTATION_TYPE, renderer)
    context.registerMeasureOverlayer(BOUNDING_BOX_ANNOTATION_TYPE, measures)
    context.registerSerializer(BOUNDING_BOX_ANNOTATION_TYPE, serializer)
    context.registerTool('bounding_box_tool', tool)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(BOUNDING_BOX_ANNOTATION_TYPE)
    context.unregisterMeasureOverlayer(BOUNDING_BOX_ANNOTATION_TYPE)
    context.unregisterSerializer(BOUNDING_BOX_ANNOTATION_TYPE)
    context.unregisterTool('bounding_box_tool')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default boundingBox
