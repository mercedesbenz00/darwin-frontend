import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { SkeletonRenderer } from './SkeletonRenderer'
import { annotationType } from './consts'
import { skeletonSerializer } from './serializer'
import { skeletonTool } from './tool'
import { SkeletonNode } from './types'
import { isSkeleton } from './utils'

const skeleton: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(annotationType, new SkeletonRenderer(context.editor))
    context.registerSerializer(annotationType, skeletonSerializer)
    context.registerTool('skeleton_tool', skeletonTool)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(annotationType)
    context.unregisterSerializer(annotationType)
    context.unregisterTool('skeleton_tool')

    for (const handle of context.handles) {
      handle.release()
    }
    // TODO: deregister the tool and annotation type
  }
}

export const getEdgesAsPaths = (nodes: SkeletonNode[], edges: { from: string, to: string }[]) => {
  const paths = []
  for (const edge of edges) {
    const fromNode = nodes.find(node => node.name === edge.from)
    const toNode = nodes.find(node => node.name === edge.to)
    if (!fromNode || !toNode) { continue }
    paths.push([fromNode.point, toNode.point])
  }
  return paths
}

export { isSkeleton }

export default skeleton
