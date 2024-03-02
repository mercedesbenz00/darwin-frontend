import { Editor } from '@/engine/editor'
import { isMainAnnotationTypeRenderer } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { calcCentroidPointFromPath } from '@/engine/utils'
import { ImagePoint } from '@/engineCommon/point'

import { Link } from './types'

export const getLinkAnnotationData = (annotation: Annotation, view: IView) => {
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
