import { MeasureOverlayer } from '@/engine/managers'
import {
  View,
  Annotation,
  AnnotationData,
  MeasureOverlayData,
  MeasureOverlayItem
} from '@/engine/models'
import { calcCentroidPointFromPath, getMeasureOverlayColorFromAnnotation } from '@/engine/utils'
import { MeasureUnit } from '@/store/types'

import { Polygon, POLYGON_ANNOTATION_TYPE } from './types'

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
    const { path } = data as Polygon
    if (path.length === 0) { return emptyMeasures }

    const centroid = calcCentroidPointFromPath(view, path, POLYGON_ANNOTATION_TYPE)
    const canvasCentroid = view.camera.imageViewToCanvasView(centroid)
    if (!canvasCentroid) { return emptyMeasures }
    // Add padding not to make it overlap with the annotation overlay
    canvasCentroid.y -= 30

    let maxX = path[0].x
    let minX = path[0].x
    let maxY = path[0].y
    let minY = path[0].y

    path.forEach((p) => {
      if (p.x > maxX) { maxX = p.x }
      if (p.x < minX) { minX = p.x }
      if (p.y > maxY) { maxY = p.y }
      if (p.y < minY) { minY = p.y }
    })

    const mw = ((maxX - minX) * measureRegion.delta.x).toFixed(2)
    const mh = ((maxY - minY) * measureRegion.delta.y).toFixed(2)
    const label = `H: ${mh}${unit} W: ${mw}${unit}`

    const measures: MeasureOverlayItem[] = [
      // Bottom Center
      {
        center: 'HOR',
        position: canvasCentroid,
        value: `(${mw} ${unit}, ${mh} ${unit})`,
        // Hacky solution not to add `unit` at the end of display string
        unit: ''
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
  calculateMeasureOverlayData (
    view: View,
    annotation: Annotation
  ): MeasureOverlayData | null {
    const { label, measures } = this.calculateMeasures(view, annotation.data as AnnotationData)

    if (measures.length === 0) { return null }
    return {
      id: annotation.id,
      color: getMeasureOverlayColorFromAnnotation(annotation),
      label,
      measures
    }
  }
}
