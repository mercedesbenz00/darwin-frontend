import { EditablePoint, IPoint } from '@/engineCommon/point'
import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

import { Polyline } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData) {
    const polyline = data as Polyline
    return {
      line: {
        path: polyline.path.map(({ x, y }: IPoint) => ({ x, y }))
      }
    }
  },

  deserialize (rawData): AnnotationData {
    const path = rawData.line.path.map((point: IPoint) => new EditablePoint(point))
    return {
      path
    }
  }
}
