import { AutoAnnotateData } from '@/engine/models/annotation'
import { Click } from '@/engineCommon/backend'
import { Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'

export const payloadRelativeToCentroid = (
  payload: { clicks: Click[], bbox: Rectangle<'Image'> },
  centroid: Point<'Image'>
): Omit<AutoAnnotateData, 'model'> => {
  const { left: x1, right: x2, top: y1, bottom: y2 } = new Rectangle(
    payload.bbox.topLeft.sub(centroid),
    payload.bbox.bottomRight.sub(centroid)
  )
  return {
    clicks: payload.clicks.map(click => {
      return { ...click, x: click.x - centroid.x, y: click.y - centroid.y }
    }),
    bbox: { x1, x2, y1, y2 }
  }
}
