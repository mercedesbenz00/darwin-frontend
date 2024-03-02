import { combine, polygon, segments, selectUnion } from 'polybooljs'

import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { fromPolyBool, toPolyBool } from '@/engineV2/plugins/brush/utils'
import { Polygon } from '@/engineV2/plugins/polygon/types'
import { polygonToCompoundPath } from '@/engineV2/utils'
import { View } from '@/engineV2/views'

import { matchAnnotation, mergeSubAnnotations } from './utils'

export const mergePolygonsAction = (
  view: View,
  firstAnnotation: Annotation,
  secondAnnotation: Annotation
): Action => {
  const previousFirstAnnotationData = firstAnnotation.data
  const { id: secondAnnotationId } = secondAnnotation

  return {
    do (): boolean {
      const polygonCompoundPath1 = polygonToCompoundPath(firstAnnotation.data as Polygon)
      const polygonCompoundPath2 = polygonToCompoundPath(secondAnnotation.data as Polygon)
      const segment1 = segments(toPolyBool(polygonCompoundPath1))
      const segment2 = segments(toPolyBool(polygonCompoundPath2))

      const combined = combine(segment1, segment2)

      const mergedSegment = selectUnion(combined)
      const mergedPolygon = fromPolyBool(polygon(mergedSegment))

      const subAnnotations = mergeSubAnnotations(firstAnnotation, secondAnnotation)

      const match = matchAnnotation(view, secondAnnotationId)
      if (!match) { return false }
      view.annotationManager.deleteAnnotation(match)
      view.annotationManager.updateAnnotation(
        firstAnnotation.shallowClone({
          data: {
            ...firstAnnotation.data,
            path: mergedPolygon.path,
            additionalPaths: mergedPolygon.additionalPaths
          },
          subAnnotations
        })
      )

      return true
    },
    undo (): boolean {
      firstAnnotation.data = previousFirstAnnotationData
      try {
        view.annotationManager.createAnnotation(secondAnnotation)
      } catch (e: unknown) {
        console.error(e)
        return false
      }
      view.annotationManager.updateAnnotation(firstAnnotation)

      return true
    }
  }
}
