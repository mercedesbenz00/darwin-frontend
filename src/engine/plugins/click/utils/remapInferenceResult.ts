import { PointMapping } from '@/engine/plugins/click/types'
import { InferenceResult } from '@/engineCommon/backend'
import { Point } from '@/engineCommon/point'

const remapPoint = (
  point: { x: number, y: number },
  mapping: PointMapping<'Image'>
): Point<'Image'> => {
  return mapping.backward(new Point(point))
}

const remapPath = (
  path: { x: number, y: number }[],
  mapping: PointMapping<'Image'>
): Point<'Image'>[] => {
  return path.map(point => remapPoint(point, mapping))
}

export const remapInferenceResult = (
  inferenceData: InferenceResult,
  mapping: PointMapping<'Image'>
): InferenceResult => {
  const {
    bounding_box: boundingBox,
    complex_polygon: complexPolygon,
    path
  } = inferenceData

  if (path) {
    return { ...inferenceData, path: remapPath(path, mapping) }
  }

  if (complexPolygon) {
    return {
      ...inferenceData,
      complex_polygon: complexPolygon.map(path => remapPath(path, mapping))
    }
  }

  if (boundingBox) {
    const { x: xmin, y: ymin, w, h } = boundingBox
    const xmax = xmin + w
    const ymax = ymin + h

    const { x: mappedXmin, y: mappedYmin } = remapPoint({ x: xmin, y: ymin }, mapping)
    const { x: mappedXmax, y: mappedYmax } = remapPoint({ x: xmax, y: ymax }, mapping)
    return {
      ...inferenceData,
      bounding_box: {
        x: mappedXmin,
        y: mappedYmin,
        w: mappedXmax - mappedXmin,
        h: mappedYmax - mappedYmin
      }
    }
  }

  return inferenceData
}
