import { combine, polygon, segments, selectDifference } from 'polybooljs'

import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { fromPolyBool, toPolyBool } from '@/engine/plugins/brush/utils'
import { Polygon } from '@/engine/plugins/polygon/types'
import { polygonToCompoundPath } from '@/engine/utils'

export const subtractPolygonsAction = (
  editor: Editor,
  firstAnnotation: Annotation,
  secondAnnotation: Annotation
): Action => {
  const previousSecondAnnotationData = secondAnnotation.data

  return {
    async do (): Promise<boolean> {
      const polygonCompoundPath1 = polygonToCompoundPath(firstAnnotation.data as Polygon)
      const polygonCompoundPath2 = polygonToCompoundPath(secondAnnotation.data as Polygon)
      const segment1 = segments(toPolyBool(polygonCompoundPath1))
      const segment2 = segments(toPolyBool(polygonCompoundPath2))

      const combined = combine(segment2, segment1)

      const subtractedSegment = selectDifference(combined)
      const subtractedPolygon = fromPolyBool(polygon(subtractedSegment))
      if (subtractedPolygon.path.length === 0) {
        editor
          .store
          .dispatch(
            'toast/warning', {
              content: 'You cannot delete entire annotations with subtractions'
            })
        return false
      }

      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(
          secondAnnotation.shallowClone({
            data: {
              ...secondAnnotation.data,
              path: subtractedPolygon.path,
              additionalPaths: subtractedPolygon.additionalPaths
            }
          })
        )
      return true
    },
    async undo (): Promise<boolean> {
      secondAnnotation.data = previousSecondAnnotationData
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(secondAnnotation)
      return true
    }
  }
}
