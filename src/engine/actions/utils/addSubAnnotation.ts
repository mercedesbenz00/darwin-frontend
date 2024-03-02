import { Editor } from '@/engine/editor'
import { Annotation, isVideoSubAnnotations } from '@/engine/models'

export function addSubAnnotation (
  editor: Editor,
  annotation: Annotation,
  parent: Annotation
): void {
  if (isVideoSubAnnotations(parent.subAnnotations)) {
    const res = editor.getVideoSubAnnotationData(parent)
    if (!res?.subs) { return }
    res.subs.push(annotation)
  } else {
    parent.subAnnotations.push(annotation)
  }
  annotation.show()
}
