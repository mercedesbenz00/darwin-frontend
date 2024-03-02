import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models/annotation'
import { euclideanDistance } from '@/engineCommon/algebra'
import { EditablePoint } from '@/engineCommon/point'

import { Ellipse } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const { center, right, top } = data as Ellipse
    return {
      ellipse: {
        center: { x: center.x, y: center.y },
        radius: { x: euclideanDistance(center, right), y: euclideanDistance(center, top) },
        angle: Math.atan2(right.y - center.y, right.x - center.x)
      }
    }
  },

  deserialize (rawData: any): AnnotationData {
    const { center, radius, angle } = rawData.ellipse
    const right = new EditablePoint<'Image'>({
      x: center.x + radius.x * Math.cos(angle),
      y: center.y + radius.x * Math.sin(angle)
    })
    const top = new EditablePoint<'Image'>({
      x: center.x + radius.y * Math.cos(angle - Math.PI / 2),
      y: center.y + radius.y * Math.sin(angle - Math.PI / 2)
    })
    const centerPoint = new EditablePoint<'Image'>(center)
    const left = new EditablePoint<'Image'>(centerPoint.add(centerPoint.sub(right)))
    const bottom = new EditablePoint<'Image'>(centerPoint.add(centerPoint.sub(top)))
    return {
      center: centerPoint,
      right,
      top,
      left,
      bottom
    }
  }
}
