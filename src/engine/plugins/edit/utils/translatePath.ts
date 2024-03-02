import { cloneDeep } from 'lodash'

import { Editor } from '@/engine/editor'
import { isMainAnnotationTypeRenderer } from '@/engine/managers'
import { Annotation } from '@/engine/models/annotation'
import { ImagePoint } from '@/engineCommon/point'

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

  const { loadedVideo } = activeView
  if (!loadedVideo) { return }

  // Build an Annotation object with current frame data, then translate it
  const currentAnnotation = annotation.shallowClone({ data: cloneDeep(annotationData) })
  renderer.translate(currentAnnotation, offset, activeView)
  activeView.updateAnnotationFrame(
    annotation,
    currentAnnotation.data,
    subs,
    activeView.currentFrameIndex
  )
}
