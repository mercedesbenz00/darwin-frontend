import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { MaskRenderer } from './MaskRenderer'
import { serializer } from './serializer'
import { MASK_ANNOTATION_TYPE } from './types'

const mask: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerRasterRenderer(MASK_ANNOTATION_TYPE, new MaskRenderer(context.editor))
    context.registerSerializer(MASK_ANNOTATION_TYPE, serializer)
  },
  deactivate (context: PluginContext) {
    context.unregisterRasterRenderer(MASK_ANNOTATION_TYPE)
    context.unregisterSerializer(MASK_ANNOTATION_TYPE)
  }
}

export default mask
