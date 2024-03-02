import { getEllipseBoundingBox } from '@/engine/graphics/getEllipseBoundingBox'
import { MeasureOverlayer } from '@/engine/managers'
import {
  View,
  Annotation,
  AnnotationData,
  MeasureOverlayData,
  MeasureOverlayItem
} from '@/engine/models'
import { getMeasureOverlayColorFromAnnotation } from '@/engine/utils'
import { Point } from '@/engineCommon/point'
import { MeasureUnit } from '@/store/types'

import { Ellipse } from './types'

export const measures: MeasureOverlayer = {
  calculateMeasures (
    view: View,
    data: AnnotationData
  ): Pick<MeasureOverlayData, 'label' | 'measures'> {
    const { measureRegion } = view
    const emptyMeasures = { label: '', measures: [] }
    if (!measureRegion) { return emptyMeasures }
    if (measureRegion.unit.x !== measureRegion.unit.y) { return emptyMeasures }

    const unit: MeasureUnit = measureRegion.unit.x
    const { center, right, top } = data as Ellipse
    const { x, y, w, h } = getEllipseBoundingBox(center, top, right)
    const width = Math.abs(w * measureRegion.delta.x).toFixed(2)
    const height = Math.abs(h * measureRegion.delta.y).toFixed(2)
    const label = `H: ${height}${unit} W: ${width}${unit}`
    const measures: MeasureOverlayItem[] = [
      // Bottom Center
      {
        center: 'HOR',
        position: view.camera.imageViewToCanvasView(
          new Point({ x: center.x, y: y + h })
        ),
        value: width,
        unit
      },
      // Right Center
      {
        center: 'VER',
        position: view.camera.imageViewToCanvasView(
          new Point({ x: x + w, y: center.y })
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
      color: view.preselectedAnnotationClassColor(),
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
