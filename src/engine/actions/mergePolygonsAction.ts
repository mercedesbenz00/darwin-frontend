import { combine, polygon, segments, selectUnion } from 'polybooljs'

import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { fromPolyBool, toPolyBool } from '@/engine/plugins/brush/utils'
import { Polygon } from '@/engine/plugins/polygon/types'
import { polygonToCompoundPath } from '@/engine/utils'

import { matchAnnotation, mergeSubAnnotations } from './utils'

export const mergePolygonsAction = (
  editor: Editor,
  firstAnnotation: Annotation,
  secondAnnotation: Annotation
): Action => {
  const previousFirstAnnotationData = firstAnnotation.data
  const { id: secondAnnotationId } = secondAnnotation

  return {
    async do (): Promise<boolean> {
      const polygonCompoundPath1 = polygonToCompoundPath(firstAnnotation.data as Polygon)
      const polygonCompoundPath2 = polygonToCompoundPath(secondAnnotation.data as Polygon)
      const segment1 = segments(toPolyBool(polygonCompoundPath1))
      const segment2 = segments(toPolyBool(polygonCompoundPath2))

      const combined = combine(segment1, segment2)

      const mergedSegment = selectUnion(combined)
      const mergedPolygon = fromPolyBool(polygon(mergedSegment))

      const subAnnotations = mergeSubAnnotations(firstAnnotation, secondAnnotation)

      const match = matchAnnotation(editor, secondAnnotationId)
      if (!match) { return false }
      await Promise.all([
        editor
          .activeView
          .annotationManager
          .persistDeleteAnnotation(match),
        editor
          .activeView
          .annotationManager
          .persistUpdateAnnotation(
            firstAnnotation.shallowClone({
              data: {
                ...firstAnnotation.data,
                path: mergedPolygon.path,
                additionalPaths: mergedPolygon.additionalPaths
              },
              subAnnotations
            })
          )
      ])

      return true
    },
    async undo (): Promise<boolean> {
      firstAnnotation.data = previousFirstAnnotationData
      await Promise.all([
        editor
          .activeView
          .annotationManager
          .persistCreateAnnotation(secondAnnotation),
        editor
          .activeView
          .annotationManager
          .persistUpdateAnnotation(firstAnnotation)
      ])

      return true
    }
  }
}
