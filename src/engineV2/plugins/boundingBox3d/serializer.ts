import { EditablePoint } from '@/engineCommon/point'
import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models/annotation'

import { BoundingBox3D } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const cuboid = data as BoundingBox3D
    const { x: xftl, y: yftl } = cuboid.front.topLeft
    const { x: xfbr, y: yfbr } = cuboid.front.bottomRight
    const { x: xbtl, y: ybtl } = cuboid.back.topLeft
    const { x: xbbr, y: ybbr } = cuboid.back.bottomRight
    return {
      cuboid: {
        front: { x: xftl, y: yftl, w: xfbr - xftl, h: yfbr - yftl },
        back: { x: xbtl, y: ybtl, w: xbbr - xbtl, h: ybbr - ybtl }
      }
    }
  },

  deserialize (rawData: any): AnnotationData {
    const front = {
      topLeft: new EditablePoint({ x: rawData.cuboid.front.x, y: rawData.cuboid.front.y }),
      bottomRight: new EditablePoint({
        x: rawData.cuboid.front.x + rawData.cuboid.front.w,
        y: rawData.cuboid.front.y + rawData.cuboid.front.h
      }),
      topRight: new EditablePoint({
        x: rawData.cuboid.front.x + rawData.cuboid.front.w,
        y: rawData.cuboid.front.y
      }),
      bottomLeft: new EditablePoint({
        x: rawData.cuboid.front.x,
        y: rawData.cuboid.front.y + rawData.cuboid.front.h
      })
    }
    const back = {
      topLeft: new EditablePoint({ x: rawData.cuboid.back.x, y: rawData.cuboid.back.y }),
      bottomRight: new EditablePoint({
        x: rawData.cuboid.back.x + rawData.cuboid.back.w,
        y: rawData.cuboid.back.y + rawData.cuboid.back.h
      }),
      topRight: new EditablePoint({
        x: rawData.cuboid.back.x + rawData.cuboid.back.w,
        y: rawData.cuboid.back.y
      }),
      bottomLeft: new EditablePoint({
        x: rawData.cuboid.back.x,
        y: rawData.cuboid.back.y + rawData.cuboid.back.h
      })
    }
    return { front, back }
  }
}
