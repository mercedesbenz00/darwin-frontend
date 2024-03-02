import { Editor } from '@/engine/editor'
import { drawLink } from '@/engine/graphics'
import { Annotation, View, MainAnnotationTypeRenderer, CompoundPath } from '@/engine/models'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint } from '@/engineCommon/point'

import { getLinkAnnotationData, inferCentroid } from './utils'

function getPath (annotation: Annotation, editor: Editor): EditableImagePoint[] {
  const { from, to } = getLinkAnnotationData(annotation, editor.activeView)

  const { mainAnnotations } = editor.activeView

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
    view: View,
    annotation: Annotation,
    _: boolean,
    filter: ImageManipulationFilter | null
  ): void {
    const path = getPath(annotation, this.editor)
    const color = annotation.color
    drawLink(view, path, color, filter, annotation.isSelected)
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
