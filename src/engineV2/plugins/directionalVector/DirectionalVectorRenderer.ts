import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { drawVector, drawVectorV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, AnnotationTypeRenderer, View, ILayer, DrawCallback } from '@/engineV2/models'
import { calcCentroidPoint } from '@/engineV2/utils'
import { RGBA } from '@/utils'

import { DirectionalVector } from './types'

export class DirectionalVectorRenderer extends AnnotationTypeRenderer {
  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
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
    if (FeatureFlagsManager.isOnLayerV2) {
      drawVectorV2(drawFn, view.camera, centroid, vector, color, filter)
    } else {
      drawVector(view.camera, layer.context, centroid, vector, color, filter)
    }
  }
}
