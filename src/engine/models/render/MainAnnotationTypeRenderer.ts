import { InterpolationParams } from '@/engine/interpolate'
import { Annotation, AnnotationData, CommentThread } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { EditableImagePoint, ImagePoint } from '@/engineCommon/point'

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

  abstract getAllVertices(annotation: Annotation | CommentThread, view: IView): EditableImagePoint[]
  abstract getPath(annotation: Annotation | CommentThread, view: IView): CompoundPath

  abstract moveVertex(
    annotation: Annotation | CommentThread,
    vertex: EditableImagePoint,
    offset: ImagePoint,
    view: IView,
    specialKey?: SpecialKey
  ): void

  abstract translate(
    annotation: Annotation | CommentThread,
    offset: ImagePoint,
    view: IView
  ): void

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCentroidRectPath (annotation: Annotation | CommentThread): EditableImagePoint[] | undefined {
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
