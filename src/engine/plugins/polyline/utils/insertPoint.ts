import { addVertexAction } from '@/engine/actions'
import { ToolContext } from '@/engine/managers'
import { PolylineTool } from '@/engine/plugins/polyline/tool'
import { AddingPointContext } from '@/engine/plugins/polyline/types'
import { EditablePoint } from '@/engineCommon/point'

/**
 * Inserts new vertex into existing polyline and persists to backend
 * @param tool The instance of the polyline tool
 * @param context The provided tool context
 */
export const insertPoint = (tool: PolylineTool & AddingPointContext, context: ToolContext) => {
  const { pointOnLine, pointOnLineAnnotation, pointOnLinePosition, pointOnLinePath } = tool
  const imagePoint = context.editor.camera.canvasViewToImageView(pointOnLine)
  const newVertex = new EditablePoint<'Image'>(imagePoint)

  tool.actionGroup = tool.actionGroup || context.editor.actionManager.createGroup()

  const action = addVertexAction(
    context.editor,
    pointOnLineAnnotation,
    pointOnLinePath,
    pointOnLinePosition,
    newVertex
  )

  tool.actionGroup.do(action)
}
