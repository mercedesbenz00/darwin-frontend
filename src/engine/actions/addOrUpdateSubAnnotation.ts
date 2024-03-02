import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation, isVideoSubAnnotations } from '@/engine/models'

import { addSubAnnotationAction } from './addSubAnnotationAction'
import { updateSubAnnotationAction } from './updateSubAnnotationAction'
import { updateSubAnnotationKeyframeAction } from './updateSubAnnotationKeyframeAction'

export function addOrUpdateSubAnnotation (
  editor: Editor,
  annotation: Annotation,
  parent: Annotation
): Action {
  let previousSubAnnotation
  if (isVideoSubAnnotations(parent.subAnnotations)) {
    const { subs, subkeyframe } = editor.getVideoSubAnnotationData(parent)

    previousSubAnnotation =
      subs.find(ann => ann.type === annotation.type && ann.parentId === parent!.id)

    if (previousSubAnnotation && subkeyframe) {
      return updateSubAnnotationAction(editor, annotation, parent, previousSubAnnotation)
    } else if (previousSubAnnotation) {
      return updateSubAnnotationKeyframeAction(editor, annotation, parent)
    } else if (subkeyframe) {
      return addSubAnnotationAction(editor, annotation, parent)
    } else {
      return updateSubAnnotationKeyframeAction(editor, annotation, parent)
    }
  }
  previousSubAnnotation = parent.subAnnotations
    .find(ann => ann.type === annotation.type && ann.parentId === parent!.id)
  if (previousSubAnnotation) {
    return updateSubAnnotationAction(editor, annotation, parent, previousSubAnnotation)
  } else {
    return addSubAnnotationAction(editor, annotation, parent)
  }
}
