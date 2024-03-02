import { Annotation, isVideoSubAnnotations } from '@/engineV2/models'
import { View } from '@/engineV2/views'

export function addSubAnnotation (view: View, annotation: Annotation, parent: Annotation) {
  if (isVideoSubAnnotations(parent.subAnnotations)) {
    const res = view.annotationManager.getVideoSubAnnotationData(parent)
    if (!res?.subs) { return }
    res.subs.push(annotation)
  } else {
    parent.subAnnotations.push(annotation)
  }
  annotation.show()
}
