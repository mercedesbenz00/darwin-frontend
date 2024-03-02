import { EditablePoint, IPoint } from '@/engineCommon/point'
import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

import { Polygon } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const polygon = data as Polygon

    const path = polygon.path.map(({ x, y }: IPoint) => ({ x, y }))

    const additionalPaths = polygon.additionalPaths && polygon.additionalPaths.length > 0
      ? polygon.additionalPaths.map(path => path.map(({ x, y }: IPoint) => ({ x, y })))
      : undefined

    return { polygon: { path, additional_paths: additionalPaths } }
  },

  deserialize (rawData: any): AnnotationData {
    const path = rawData.polygon.path.map((point: IPoint) => new EditablePoint(point))

    const additionalPaths = rawData.polygon.additional_paths
      ? rawData.polygon.additional_paths.map(
        (path: IPoint[]) => path.map((point: IPoint) => new EditablePoint(point)))
      : undefined

    return { path, additionalPaths }
  }
}
