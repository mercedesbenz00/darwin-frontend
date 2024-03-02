import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import { Action, AnnotationManager } from '@/engineV2/managers'
import { Annotation, ImageSubAnnotation } from '@/engineV2/models'
import store from '@/store'

export function changeAnnotationClass (
  annotationManager: AnnotationManager,
  annotation: Annotation,
  newClass: AnnotationClass
): Action {
  const oldClass = annotation.annotationClass
  const oldSubAnnotations = annotation.subAnnotations
  return {
    do (): boolean {
      const annotationTypes: AnnotationType[] = store
        .getters['aclass/subAnnotationTypesForClass'](newClass)

      const targetSubs = annotationTypes
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
      annotationManager.updateAnnotation(annotation)
      return true
    },
    undo (): boolean {
      annotation.classId = oldClass ? oldClass.id : 0
      annotation.annotationClass = oldClass
      annotation.subAnnotations = oldSubAnnotations
      annotationManager.updateAnnotation(annotation)
      return true
    }
  }
}
