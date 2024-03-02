import { Editor } from '@/engineV2/editor'
import {
  Annotation,
  AnnotationData,
  isImageAnnotationDataPayload,
  isVideoAnnotationDataPayload,
  isVideoSubAnnotations
} from '@/engineV2/models'

export const getInferenceData = (
  annotationData: AnnotationData,
  editor: Editor
): AnnotationData | null => {
  return isVideoAnnotationDataPayload(annotationData)
    ? editor.activeView.annotationManager.inferVideoAnnotationDataOnly(annotationData, 'inference')
    : isImageAnnotationDataPayload(annotationData)
      ? annotationData
      : null
}

export const getAnnotationInferenceData = (
  annotation: Annotation,
  editor: Editor
): AnnotationData | null => {
  let inferenceSubAnnotation: Annotation | undefined

  if (isVideoSubAnnotations(annotation.subAnnotations)) {
    const subs = editor.activeView.annotationManager.inferVideoSubAnnotations(annotation)
    inferenceSubAnnotation = subs.find(ann => ann.type === 'inference')
  } else {
    inferenceSubAnnotation = annotation.subAnnotations.find(ann => ann.type === 'inference')
  }

  if (!inferenceSubAnnotation) { return null }

  return getInferenceData(inferenceSubAnnotation.data, editor)
}
