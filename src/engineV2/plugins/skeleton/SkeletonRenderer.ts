import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint } from '@/engineCommon/point'
import { drawSkeleton, drawSkeletonV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  Annotation,
  MainAnnotationTypeRenderer,
  ILayer,
  CompoundPath,
  DrawCallback
} from '@/engineV2/models'
import { LinearInterpolationParams } from '@/engineV2/utils/interpolate'
import { View } from '@/engineV2/views'

import { Skeleton } from './types'
import { getPath, isSkeleton } from './utils'

export class SkeletonRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = true
  readonly enableInterpolateByDefault: boolean = true

  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
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
    if (FeatureFlagsManager.isOnLayerV2) {
      drawSkeletonV2(drawFn, view.camera, nodes, edges, color, filter, annotation.isSelected)
    } else {
      annotation.path2D =
        drawSkeleton(view.camera, layer.context, nodes, edges, color, filter, annotation.isSelected)
    }
  }

  getPath (annotation: Annotation, view: View): CompoundPath {
    return { path: getPath(annotation, view), additionalPaths: [] }
  }

  getAllVertices (annotation: Annotation, view: View): EditableImagePoint[] {
    return getPath(annotation, view)
  }

  translate (annotation: Annotation, offset: ImagePoint, view: View): void {
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
