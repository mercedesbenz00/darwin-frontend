import { mergePolygonsAction } from '@/engine/actions'
import { ToolContext } from '@/engine/managers'
import { Annotation } from '@/engine/models'

export const handlePolygonMerge = (
  firstAnnotation: Annotation,
  lastAnnotation: Annotation,
  context: ToolContext
): void => {
  const action = mergePolygonsAction(context.editor, firstAnnotation, lastAnnotation)
  context.editor.actionManager.do(action)
}
