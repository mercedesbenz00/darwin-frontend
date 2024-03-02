import { Point } from '@/engineCommon/point'
import { MeasureOverlayer } from '@/engineV2/managers'
import {
  Annotation,
  AnnotationData,
  MeasureOverlayData,
  MeasureOverlayItem
} from '@/engineV2/models'
import { getMeasureOverlayColorFromAnnotation } from '@/engineV2/utils'
import {
  View
} from '@/engineV2/views'
import { MeasureUnit } from '@/store/types'

import { BoundingBox } from './types'

export const measures: MeasureOverlayer = {
  calculateMeasures (
    view: View,
    data: AnnotationData
  ): Pick<MeasureOverlayData, 'label' | 'measures'> {
    const { measureRegion } = view.measureManager
    const emptyMeasures = { label: '', measures: [] }
    if (!measureRegion) { return emptyMeasures }
    if (measureRegion.unit.x !== measureRegion.unit.y) { return emptyMeasures }

    const unit: MeasureUnit = measureRegion.unit.x

    const { topLeft, bottomRight } = data as BoundingBox
    const width = Math.abs((bottomRight.x - topLeft.x) * measureRegion.delta.x).toFixed(2)
    const height = Math.abs((bottomRight.y - topLeft.y) * measureRegion.delta.y).toFixed(2)
    const label = `H: ${height}${unit} W: ${width}${unit}`
    const measures: MeasureOverlayItem[] = [
      // Bottom Center
      {
        center: 'HOR',
        position: view.camera.imageViewToCanvasView(
          new Point({
            x: (topLeft.x + bottomRight.x) / 2,
            y: bottomRight.y
          })
        ),
        value: width,
        unit
      },
      // Right Center
      {
        center: 'VER',
        position: view.camera.imageViewToCanvasView(
          new Point({
            x: bottomRight.x,
            y: (bottomRight.y + topLeft.y) / 2
          })
        ),
        value: height,
        unit
      }
    ]

    return { label, measures }
  },
  calculateDrawingMeasureOverlayData (view: View, data: AnnotationData): MeasureOverlayData | null {
    const { label, measures } = this.calculateMeasures(view, data)

    if (measures.length === 0) { return null }
    return {
      id: view.measureManager.DRAWING_ANNOTATION_ID,
      color: view.annotationManager.preselectedAnnotationClassColor(),
      label,
      measures
    }
  },
  calculateMeasureOverlayData (view: View, annotation: Annotation): MeasureOverlayData | null {
    const { label, measures } = this.calculateMeasures(view, annotation.data)

    if (measures.length === 0) { return null }
    return {
      id: annotation.id,
      color: getMeasureOverlayColorFromAnnotation(annotation),
      label,
      measures
    }
  }
}
