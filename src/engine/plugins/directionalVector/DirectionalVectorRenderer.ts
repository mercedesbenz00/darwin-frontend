import { drawVector } from '@/engine/graphics'
import { Annotation, AnnotationTypeRenderer, View } from '@/engine/models'
import { calcCentroidPoint } from '@/engine/utils'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { RGBA } from '@/utils'

import { DirectionalVector } from './types'

export class DirectionalVectorRenderer extends AnnotationTypeRenderer {
  render (
    view: View,
    annotation: Annotation,
    _: boolean,
    filter: ImageManipulationFilter | null,
    parent: Annotation
  ): void {
    const vector = annotation.data as DirectionalVector

    const canvasCentroid = calcCentroidPoint(view, parent)
    if (!canvasCentroid) { return }

    const centroid = view.camera.canvasViewToImageView(canvasCentroid)
    if (!centroid) { return }

    const color: RGBA = { r: 255, g: 255, b: 255, a: 1.0 }
    drawVector(view, centroid, vector, color, filter)
  }
}
