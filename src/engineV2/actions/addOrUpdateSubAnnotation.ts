import { Action } from '@/engineV2/managers'
import { Annotation, isVideoSubAnnotations } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { addSubAnnotationAction } from './addSubAnnotationAction'
import { updateSubAnnotationAction } from './updateSubAnnotationAction'
import { updateSubAnnotationKeyframeAction } from './updateSubAnnotationKeyframeAction'

export function addOrUpdateSubAnnotation (
  view: View,
  annotation: Annotation,
  parent: Annotation
): Action {
  let previousSubAnnotation
  if (isVideoSubAnnotations(parent.subAnnotations)) {
    const { subs, subkeyframe } = view.annotationManager.getVideoSubAnnotationData(parent)

    previousSubAnnotation =
      subs.find(ann => ann.type === annotation.type && ann.parentId === parent!.id)

    if (previousSubAnnotation && subkeyframe) {
      return updateSubAnnotationAction(view, annotation, parent, previousSubAnnotation)
    } else if (previousSubAnnotation) {
      return updateSubAnnotationKeyframeAction(view, annotation, parent)
    } else if (subkeyframe) {
      return addSubAnnotationAction(view, annotation, parent)
    } else {
      return updateSubAnnotationKeyframeAction(view, annotation, parent)
    }
  }
  previousSubAnnotation = parent.subAnnotations
    .find(ann => ann.type === annotation.type && ann.parentId === parent!.id)
  if (previousSubAnnotation) {
    return updateSubAnnotationAction(view, annotation, parent, previousSubAnnotation)
  } else {
    return addSubAnnotationAction(view, annotation, parent)
  }
}
