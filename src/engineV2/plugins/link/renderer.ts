import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint } from '@/engineCommon/point'
import { Editor } from '@/engineV2/editor'
import { drawLink, drawLinkV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, CompoundPath, MainAnnotationTypeRenderer, ILayer } from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { View } from '@/engineV2/views'

import { getLinkAnnotationData, inferCentroid } from './utils'

function getPath (annotation: Annotation, editor: Editor): EditableImagePoint[] {
  const { from, to } = getLinkAnnotationData(annotation, editor.activeView)

  const { mainAnnotations } = editor.activeView.annotationManager

  const fromAnnotation = mainAnnotations.find(annotation => annotation.id === from)
  const toAnnotation = mainAnnotations.find(annotation => annotation.id === to)

  if (!fromAnnotation || !toAnnotation) { return [] }

  const fromCentroid = inferCentroid(fromAnnotation, editor)
  const toCentroid = inferCentroid(toAnnotation, editor)

  if (!fromCentroid || !toCentroid) { return [] }

  return [fromCentroid, toCentroid].map(point => new EditablePoint(point))
}

export class LinkRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = false
  readonly enableInterpolateByDefault: boolean = false

  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    _: boolean,
    filter: ImageManipulationFilter | null
  ): void {
    const path = getPath(annotation, this.editor)
    const color = annotation.color
    if (FeatureFlagsManager.isOnLayerV2) {
      drawLinkV2(drawFn, view.camera, path, color, filter, annotation.isSelected)
    } else {
      drawLink(view.camera, layer.context, path, color, filter, annotation.isSelected)
    }
  }

  getPath (annotation: Annotation): CompoundPath {
    return { path: getPath(annotation, this.editor), additionalPaths: [] }
  }

  getAllVertices (annotation: Annotation): EditableImagePoint[] {
    return getPath(annotation, this.editor)
  }

  translate (): void {}

  moveVertex (): void {}
}
