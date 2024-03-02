import { mergePolygonsAction } from '@/engineV2/actions'
import { ToolContext } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'

export const handlePolygonMerge = (
  firstAnnotation: Annotation,
  lastAnnotation: Annotation,
  context: ToolContext
): void => {
  const action = mergePolygonsAction(context.editor.activeView, firstAnnotation, lastAnnotation)
  context.editor.actionManager.do(action)
}
