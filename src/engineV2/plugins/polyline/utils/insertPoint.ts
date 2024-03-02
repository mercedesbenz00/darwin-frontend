import { EditablePoint } from '@/engineCommon/point'
import { addVertexAction } from '@/engineV2/actions'
import { ToolContext } from '@/engineV2/managers'
import { PolylineTool } from '@/engineV2/plugins/polyline/tool'
import { AddingPointContext } from '@/engineV2/plugins/polyline/types'

/**
 * Inserts new vertex into existing polyline and persists to backend
 * @param tool The instance of the polyline tool
 * @param context The provided tool context
 */
export const insertPoint = (tool: PolylineTool & AddingPointContext, context: ToolContext) => {
  const { pointOnLine, pointOnLineAnnotation, pointOnLinePosition, pointOnLinePath } = tool
  const imagePoint = context.editor.activeView.camera.canvasViewToImageView(pointOnLine)
  const newVertex = new EditablePoint<'Image'>(imagePoint)

  tool.actionGroup = tool.actionGroup || context.editor.actionManager.createGroup()

  const action = addVertexAction(
    context.editor.activeView,
    pointOnLineAnnotation,
    pointOnLinePath,
    pointOnLinePosition,
    newVertex
  )

  tool.actionGroup.do(action)
}
