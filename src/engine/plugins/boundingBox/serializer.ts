import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models/annotation'
import { EditablePoint } from '@/engineCommon/point'

import { BoundingBox } from './types'

type BoundingBoxObject = { x: number, y: number, w: number, h: number }
/* eslint-disable camelcase */
type RawData = { bounding_box: BoundingBoxObject }
/* eslint-enable camelcase */

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const boundingBox = data as BoundingBox
    const { x: left, y: top } = boundingBox.topLeft
    const { x: right, y: bottom } = boundingBox.bottomRight
    return {
      bounding_box: {
        x: Math.min(left, right),
        y: Math.min(top, bottom),
        w: Math.abs(right - left),
        h: Math.abs(bottom - top)
      }
    }
  },

  deserialize (rawData: RawData): AnnotationData {
    const { x, y, w, h } = rawData.bounding_box
    return {
      topLeft: new EditablePoint({ x, y }),
      bottomRight: new EditablePoint({ x: x + w, y: y + h }),
      topRight: new EditablePoint({ x: x + w, y: y }),
      bottomLeft: new EditablePoint({ x: x, y: y + h })
    }
  }
}
