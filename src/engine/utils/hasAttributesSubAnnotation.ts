import { Annotation } from '@/engine/models'

export const hasAttributesSubAnnotation = (annotation: Annotation): boolean => {
  const { annotationClass } = annotation
  if (!annotationClass) { return false }

  const attributeAnnotationType = annotationClass.annotation_types.includes('attributes')

  return !!attributeAnnotationType
}
