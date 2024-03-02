import { PolylineTool } from '@/engine/plugins/polyline/tool'
import { AddingPointContext } from '@/engine/plugins/polyline/types'

/**
 * Predicate guard to ensure a new vertex is being added on mouseup
 * Converts the tool instance into an extended type.
 * @param tool The instance of the polyline tool
 */
export const isInsertingPoint = (tool: PolylineTool): tool is PolylineTool & AddingPointContext => (
  tool.currentPath.length === 0 &&
  !!tool.pointOnLine &&
  tool.pointOnLineAnnotation !== null &&
  tool.pointOnLinePath !== null &&
  tool.pointOnLinePosition !== null
)
