import { ImagePoint } from '@/engineCommon/point'
import { Editor } from '@/engineV2/editor'
import { isMainAnnotationTypeRenderer } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models/annotation'
import { calcCentroidPointFromPath } from '@/engineV2/utils'
import { View } from '@/engineV2/views'

import { Link } from './types'

export const getLinkAnnotationData = (annotation: Annotation, view: View) => {
  if (annotation.isVideoAnnotation()) {
    const res = annotation.inferVideoData(view)

    if (!res?.data) { return { from: undefined, to: undefined } }

    return res.data as Link
  }
  return annotation.data as Link
}

export const inferCentroid = (annotation: Annotation, editor: Editor): ImagePoint | undefined => {
  if (annotation.centroid) {
    return annotation.centroid
  }

  const renderer = editor.activeView.renderManager.rendererFor(annotation.type)
  if (!renderer) { return }

  if (!isMainAnnotationTypeRenderer(renderer)) { return }

  const { path } = renderer.getPath(annotation, editor.activeView)
  return calcCentroidPointFromPath(editor.activeView, path, annotation.type)
}
