import { Raster } from '@/engineV2/models'
import {
  Annotation
} from '@/engineV2/models'
import { View } from '@/engineV2/views'

/**
 * Given a classId, finds if there is an annotation associated with that
 * class on the given raster. Returns it if it finds one.
 * @param view The view on which the raster lives.
 * @param raster The raster object.
 * @param classId The classId to query
 * @returns A mask annotation on the raster with the given classId, if available.
 */
export function getAnnotationForClassIdOnRaster (
  view: View,
  raster: Raster,
  classId: number
): Annotation | undefined {
  const annotationsOnRaster = raster.annotationIdsOnRaster

  const annotationIdForMaskClass = annotationsOnRaster.find((annotationId: string) => {
    const annotationForId = view.annotationManager.getAnnotation(annotationId)

    return annotationForId?.classId === classId
  })

  if (annotationIdForMaskClass !== undefined) {
    return view.annotationManager.getAnnotation(annotationIdForMaskClass)
  }
}
