import { EditablePoint } from '@/engineCommon/point'
import { addVertexAction } from '@/engineV2/actions'
import { ToolContext } from '@/engineV2/managers'
import { PolygonTool } from '@/engineV2/plugins/polygon/tool'
import { AddingPointContext } from '@/engineV2/plugins/polygon/types'

/**
 * Inserts new vertex into existing polygon and persists to backend
 * @param tool The instance of the polygon tool
 * @param context The provided tool context
 */
export const insertPoint = (tool: PolygonTool & AddingPointContext, context: ToolContext) => {
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
