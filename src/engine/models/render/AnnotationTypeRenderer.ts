import { Editor } from '@/engine/editor'
import { Annotation, CommentThread } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'

export default abstract class AnnotationTypeRenderer {
  editor!: Editor
  constructor (editor: Editor) {
    this.editor = editor
  }

  abstract render (
    view: IView,
    annotation: Annotation | CommentThread,
    inferred: boolean,
    filter?: ImageManipulationFilter | null,
    parent?: Annotation
  ): void;
}
