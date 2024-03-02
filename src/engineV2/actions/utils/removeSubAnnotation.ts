import { Annotation, isVideoSubAnnotations } from '@/engineV2/models'

export function removeSubAnnotation (annotation: Annotation, parent: Annotation) {
  if (isVideoSubAnnotations(parent.subAnnotations)) {
    const subAnnotations = parent.subAnnotations
    for (const [index, frameData] of Object.entries(subAnnotations.frames)) {
      const i = frameData.findIndex(elem => elem.id === annotation.id)
      if (i !== -1) {
        frameData.splice(i, 1)
        subAnnotations.frames[index] = frameData
      }
    }
    return
  }

  const subAnnotations = parent.subAnnotations
  const index = subAnnotations.findIndex(elem => elem.id === annotation.id)
  if (index !== -1) {
    subAnnotations.splice(index, 1)
  }
  annotation.hide()
}
