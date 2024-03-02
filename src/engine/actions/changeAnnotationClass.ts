import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation, ImageSubAnnotation } from '@/engine/models'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'

export function changeAnnotationClass (
  editor: Editor,
  annotation: Annotation,
  newClass: AnnotationClass
): Action {
  const oldClass = annotation.annotationClass
  const oldSubAnnotations = annotation.subAnnotations
  return {
    async do (): Promise<boolean> {
      const targetSubs = editor.getSubAnnotationTypesForClass(newClass)
        .map(t => t.name)
        .filter(t => t !== 'attributes')

      if (annotation.isVideoAnnotation()) {
        const entries: [string, Annotation[]][] = []
        for (const frameIndex of Object.keys(annotation.subAnnotations.frames)) {
          const copiedSubAnnotations = []
          for (const subAnnotation of annotation.subAnnotations.frames[frameIndex]) {
            if (targetSubs.includes(subAnnotation.type)) {
              copiedSubAnnotations.push(subAnnotation)
            }
          }
          entries.push([frameIndex, copiedSubAnnotations])
        }
        const frames = Object.fromEntries(entries)
        annotation.subAnnotations = { frames }
      } else {
        annotation.subAnnotations = []
        for (const subAnnotation of oldSubAnnotations as ImageSubAnnotation[]) {
          if (targetSubs.includes(subAnnotation.type)) {
            annotation.subAnnotations.push(subAnnotation)
          }
        }
      }
      annotation.annotationClass = newClass
      annotation.classId = newClass.id
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    },
    async undo (): Promise<boolean> {
      annotation.classId = oldClass ? oldClass.id : 0
      annotation.annotationClass = oldClass
      annotation.subAnnotations = oldSubAnnotations
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    }
  }
}
