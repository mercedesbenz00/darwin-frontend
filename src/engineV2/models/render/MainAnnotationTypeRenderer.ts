import { EditableImagePoint, ImagePoint } from '@/engineCommon/point'
import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { Annotation, AnnotationData } from '@/engineV2/models/annotation'
import { InterpolationParams } from '@/engineV2/utils/interpolate'
import { View } from '@/engineV2/views'

import AnnotationTypeRenderer from './AnnotationTypeRenderer'
import { CompoundPath } from './CompoundPath'
import { SpecialKey } from './SpecialKey'

export default abstract class MainAnnotationTypeRenderer extends AnnotationTypeRenderer {
  // These two readonly variables should be redefined in derived classes.
  // If it supports "interpolate" function, "supportsInterpolate" should be true.
  // If it supports "getCentroidRectPath" function, "supportsCentroidRectPath" should be true.
  readonly supportsInterpolate: boolean = false
  // If it supports interpolation for new annotations by default,
  // "enableInterpolateByDefault" should be true.
  readonly enableInterpolateByDefault: boolean = false
  readonly supportsCentroidRectPath: boolean = false

  abstract getAllVertices(
    annotation: Annotation | EditorCommentThread,
    view: View
  ): EditableImagePoint[]

  abstract getPath(annotation: Annotation | EditorCommentThread, view: View): CompoundPath

  abstract moveVertex(
    annotation: Annotation | EditorCommentThread,
    vertex: EditableImagePoint,
    offset: ImagePoint,
    view: View,
    specialKey?: SpecialKey
  ): void

  abstract translate(
    annotation: Annotation | EditorCommentThread,
    offset: ImagePoint,
    view: View
  ): void

  /**
   * Provides default method to check the intersection of point & annotation
   */
  containsPoint (
    annotation: Annotation,
    point: ImagePoint
  ): boolean {
    const view = annotation.view
    if (annotation.isImageAnnotation()) {
      return view.annotationManager.isImageAnnotationAtPoint(annotation, point)
    }

    if (annotation.isVideoAnnotation()) {
      return view.annotationManager.isVideoAnnotationAtPoint(annotation, point)
    }

    return false
  }

  getCentroidRectPath (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    annotation: Annotation | EditorCommentThread
  ): EditableImagePoint[] | undefined {
    return undefined
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  interpolate (
    prevData: AnnotationData,
    nextData: AnnotationData,
    params: InterpolationParams
  ): AnnotationData {
    return {}
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
