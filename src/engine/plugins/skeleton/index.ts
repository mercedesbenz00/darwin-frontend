import { PluginContext } from '@/engine/editor'
import { drawSkeleton } from '@/engine/graphics'
import { LinearInterpolationParams } from '@/engine/interpolate'
import {
  EnginePlugin
} from '@/engine/managers'
import { Annotation, View, MainAnnotationTypeRenderer, CompoundPath } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint } from '@/engineCommon/point'

import { annotationType } from './consts'
import { skeletonSerializer } from './serializer'
import { skeletonTool } from './tool'
import { Skeleton, SkeletonNode } from './types'
import { getPath, isSkeleton } from './utils'

export class SkeletonRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = true
  readonly enableInterpolateByDefault: boolean = true

  render (
    view: View,
    annotation: Annotation,
    _: boolean,
    filter: ImageManipulationFilter | null
  ): void {
    const { annotationClass, data } = annotation
    if (!annotationClass) { return }

    const { color, metadata } = annotationClass
    if (!isSkeleton(data)) {
      throw new Error('skeleton: expected annotation of skeleton type')
    }
    const { nodes } = data
    if (!metadata.skeleton) { return }
    const { skeleton: { edges } } = metadata
    annotation.path2D = drawSkeleton(view, nodes, edges, color, filter, annotation.isSelected)
  }

  getPath (annotation: Annotation, view: IView): CompoundPath {
    return { path: getPath(annotation, view), additionalPaths: [] }
  }

  getAllVertices (annotation: Annotation, view: IView): EditableImagePoint[] {
    return getPath(annotation, view)
  }

  translate (annotation: Annotation, offset: ImagePoint, view: IView): void {
    getPath(annotation, view).map(point => point.add_(offset))
  }

  moveVertex (annotation: Annotation, movingVertex: EditableImagePoint, offset: ImagePoint): void {
    movingVertex.add_(offset)
  }

  interpolate (
    prevData: Skeleton,
    nextData: Skeleton,
    params: LinearInterpolationParams
  ): Skeleton {
    const { algorithm, interpolationFactor } = params

    if (!algorithm || algorithm.startsWith('linear')) {
      return {
        nodes: prevData.nodes
          .map(prevNode => {
            const nextNode = nextData.nodes.find(node => node.name === prevNode.name)!
            return {
              name: prevNode.name,
              occluded: prevNode.occluded,
              point: new EditablePoint<'Image'>(
                prevNode.point.add(nextNode.point.sub(prevNode.point).mul(interpolationFactor))
              )
            }
          })
      }
    }

    throw new Error(`Interpolate: skeletons don't support '${algorithm}' interpolation algorithm`)
  }
}

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

export const getEdgesAsPaths =
  (nodes: SkeletonNode[], edges: { from: string, to: string }[]): EditableImagePoint[][] => {
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
