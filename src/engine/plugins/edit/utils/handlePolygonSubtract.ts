import { subtractPolygonsAction } from '@/engine/actions'
import { ToolContext } from '@/engine/managers'
import { Annotation } from '@/engine/models'

export const handlePolygonSubtract = (
  firstAnnotation: Annotation,
  lastAnnotation: Annotation,
  context: ToolContext
): void => {
  const action = subtractPolygonsAction(context.editor, firstAnnotation, lastAnnotation)
  context.editor.actionManager.do(action)
}
