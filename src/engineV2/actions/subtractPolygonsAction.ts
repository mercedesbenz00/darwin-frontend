import { combine, polygon, segments, selectDifference } from 'polybooljs'

import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { fromPolyBool, toPolyBool } from '@/engineV2/plugins/brush/utils'
import { Polygon } from '@/engineV2/plugins/polygon/types'
import { polygonToCompoundPath } from '@/engineV2/utils'
import { View } from '@/engineV2/views'

export const subtractPolygonsAction = (
  view: View,
  firstAnnotation: Annotation,
  secondAnnotation: Annotation
): Action => {
  const previousSecondAnnotationData = secondAnnotation.data

  return {
    do () {
      const polygonCompoundPath1 = polygonToCompoundPath(firstAnnotation.data as Polygon)
      const polygonCompoundPath2 = polygonToCompoundPath(secondAnnotation.data as Polygon)
      const segment1 = segments(toPolyBool(polygonCompoundPath1))
      const segment2 = segments(toPolyBool(polygonCompoundPath2))

      const combined = combine(segment2, segment1)

      const subtractedSegment = selectDifference(combined)
      const subtractedPolygon = fromPolyBool(polygon(subtractedSegment))
      if (subtractedPolygon.path.length === 0) {
        view.store.dispatch(
          'toast/warning',
          { content: 'You cannot delete entire annotations with subtractions' }
        )
        return false
      }

      view.annotationManager.updateAnnotation(
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
    undo () {
      secondAnnotation.data = previousSecondAnnotationData
      view.annotationManager.updateAnnotation(secondAnnotation)
      return true
    }
  }
}
