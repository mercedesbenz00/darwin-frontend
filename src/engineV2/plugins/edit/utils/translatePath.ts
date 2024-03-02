import { cloneDeep } from 'lodash'

import { ImagePoint } from '@/engineCommon/point'
import { Editor } from '@/engineV2/editor'
import { isMainAnnotationTypeRenderer } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models/annotation'

export const translatePath = (
  editor: Editor,
  annotation: Annotation,
  offset: ImagePoint
): void => {
  const { activeView } = editor

  const renderer = activeView.renderManager.rendererFor(annotation.type)
  if (!isMainAnnotationTypeRenderer(renderer)) { return }

  if (!annotation.isVideoAnnotation()) {
    return renderer.translate(annotation, offset, activeView)
  }

  const { data: annotationData, subs } = annotation.inferVideoData(activeView)
  if (!annotationData) { return }

  const { isLoading } = activeView
  if (isLoading) { return }

  // Build an Annotation object with current frame data, then translate it
  const currentAnnotation = annotation.shallowClone({ data: cloneDeep(annotationData) })
  renderer.translate(currentAnnotation, offset, activeView)
  activeView.annotationManager.updateAnnotationFrame(
    annotation,
    currentAnnotation.data,
    subs,
    activeView.currentFrameIndex
  )
}
