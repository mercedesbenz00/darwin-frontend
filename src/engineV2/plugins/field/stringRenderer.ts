import { EditableImagePoint } from '@/engineCommon/point'
import { drawText, drawTextV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, CompoundPath, MainAnnotationTypeRenderer, ILayer } from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { View } from '@/engineV2/views'

import { Graph, String } from './types'

function getPath (annotation: Annotation): EditableImagePoint[] {
  const { boundingBox } = annotation
  if (!boundingBox) { return [] }

  return [
    boundingBox.topLeft,
    boundingBox.topRight,
    boundingBox.bottomRight,
    boundingBox.bottomLeft
  ]
}

export class StringRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = false
  readonly enableInterpolateByDefault: boolean = false

  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    inferred: boolean
  ): void {
    const { inferenceData, mainAnnotations } = view.annotationManager
    const annotations = inferred ? inferenceData : mainAnnotations
    if (!annotations) { return }

    if (!annotation.boundingBox) {
      annotation.initializeCachedAttributes()
    }

    let stringData: String
    if (annotation.isVideoAnnotation()) {
      const { data } = annotation.inferVideoData(view)
      stringData = data as String
    } else {
      stringData = annotation.data as String
    }

    for (const source of stringData.sources) {
      const sourceAnnotation = annotations.find(a => a.id === source.id)
      if (!sourceAnnotation) { continue }

      if (!sourceAnnotation.boundingBox || !sourceAnnotation.text) { continue }

      if (!annotation.isHighlighted) { continue }

      const annotationBBoxWidth = 
        sourceAnnotation.boundingBox.topRight.x - sourceAnnotation.boundingBox.topLeft.x
      const annotationBBoxHeight = 
        sourceAnnotation.boundingBox.bottomLeft.y - sourceAnnotation.boundingBox.topLeft.y

      if (FeatureFlagsManager.isOnLayerV2) {
        drawTextV2(
          drawFn,
          sourceAnnotation.boundingBox.topLeft,
          annotationBBoxWidth,
          annotationBBoxHeight,
          sourceAnnotation.text,
          { r: 255, g: 255, b: 255, a: 1.0 },
          { r: 0, g: 0, b: 0, a: 0.8 },
          'FiraMono'
        )
      } else {
        drawText(
          view.camera,
          layer.context,
          sourceAnnotation.boundingBox.topLeft,
          annotationBBoxWidth,
          annotationBBoxHeight,
          sourceAnnotation.text,
          { r: 255, g: 255, b: 255, a: 1.0 },
          { r: 0, g: 0, b: 0, a: 0.8 },
          'FiraMono'
        )
      }
    }
  }

  getPath (annotation: Annotation, view: View): CompoundPath {
    const graphData: Graph = annotation.isVideoAnnotation()
      ? annotation.inferVideoData(view).data as Graph
      : annotation.data as Graph

    const paths: EditableImagePoint[][] = []
    for (const node of graphData.nodes) {
      const nodeAnnotation = view.annotationManager.mainAnnotations.find(a => a.id === node.id)
      if (!nodeAnnotation) { continue }

      paths.push(getPath(nodeAnnotation))
    }

    return { path: paths[0], additionalPaths: paths.slice(1) }
  }

  getAllVertices (annotation: Annotation): EditableImagePoint[] {
    return getPath(annotation)
  }

  translate (): null { return null }

  moveVertex (): null { return null }
}
