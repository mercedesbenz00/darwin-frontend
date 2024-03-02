import { EditableImagePoint } from '@/engineCommon/point'
import { MeasureOverlayer } from '@/engineV2/managers'
import {
  View,
  Annotation,
  AnnotationData,
  MeasureOverlayData,
  MeasureOverlayItem
} from '@/engineV2/models'
import { calcCentroidPointFromPath, getMeasureOverlayColorFromAnnotation } from '@/engineV2/utils'
import { MeasureUnit } from '@/store/types'

import { Polyline, POLYLINE_ANNOTATION_TYPE } from './types'

export const calcValue = (path: EditableImagePoint[], delta: { x: number; y: number }) => {
  return path.reduce((value, point, index) => {
    if (index === 0) { return value }
    const { x: x1, y: y1 } = path[index]
    const { x: x2, y: y2 } = path[index - 1]
    const edgeLength = Math.sqrt(
      Math.pow(delta.x * (x2 - x1), 2) +
      Math.pow(delta.y * (y2 - y1), 2)
    )
    return value + edgeLength
  }, 0)
}

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
    const { path } = data as Polyline
    if (path.length === 0) { return emptyMeasures }

    const centroid = calcCentroidPointFromPath(view, path, POLYLINE_ANNOTATION_TYPE)
    const canvasCentroid = view.camera.imageViewToCanvasView(centroid)
    if (!canvasCentroid) { return emptyMeasures }
    // Add padding not to make it overlap with the annotation overlay
    canvasCentroid.y -= 30

    const length = calcValue(path, measureRegion.delta).toFixed(2)
    const label = `Length: ${length}${unit}`
    const measures: MeasureOverlayItem[] = [
      // Bottom Center
      {
        center: 'HOR',
        position: canvasCentroid,
        value: length,
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
