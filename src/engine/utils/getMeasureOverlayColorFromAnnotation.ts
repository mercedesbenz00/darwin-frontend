import { Annotation } from '@/store/types'
import { getRGBAColorHash, rgbaString } from '@/utils'

export const getMeasureOverlayColorFromAnnotation = (annotation: Annotation): string => {
  if (!annotation.annotationClass) {
    return rgbaString(getRGBAColorHash(annotation.label), 0.7)
  }
  return rgbaString(annotation.annotationClass.color, 0.7)
}
