import { drawText } from '@/engine/graphics'
import {
  Annotation,
  CompoundPath,
  MainAnnotationTypeRenderer,
  View
} from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { EditableImagePoint } from '@/engineCommon/point'

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

  render (view: View, annotation: Annotation, inferred: boolean): void {
    const { inferenceData, mainAnnotations } = view
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

      drawText(
        view,
        sourceAnnotation.boundingBox.topLeft,
        sourceAnnotation.boundingBox.topRight.x - sourceAnnotation.boundingBox.topLeft.x,
        sourceAnnotation.boundingBox.bottomLeft.y - sourceAnnotation.boundingBox.topLeft.y,
        sourceAnnotation.text,
        { r: 255, g: 255, b: 255, a: 1.0 },
        { r: 0, g: 0, b: 0, a: 0.8 },
        'FiraMono'
      )
    }
  }

  getPath (annotation: Annotation, view: IView): CompoundPath {
    const graphData: Graph = annotation.isVideoAnnotation()
      ? annotation.inferVideoData(view).data as Graph
      : annotation.data as Graph

    const paths: EditableImagePoint[][] = []
    for (const node of graphData.nodes) {
      const nodeAnnotation = view.editor.mainAnnotations.find(a => a.id === node.id)
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
