import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { Annotation } from '@/engineV2/models/annotation'
import { DrawCallback, ILayer } from '@/engineV2/models/layers/types'
import { View } from '@/engineV2/views'

import Renderer from './Renderer'

export default abstract class AnnotationTypeRenderer extends Renderer {
  abstract render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation | EditorCommentThread,
    inferred: boolean,
    filter?: ImageManipulationFilter | null,
    parent?: Annotation
  ): void;
}
