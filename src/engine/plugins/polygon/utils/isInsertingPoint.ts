import { PolygonTool } from '@/engine/plugins/polygon/tool'
import { AddingPointContext } from '@/engine/plugins/polygon/types'

/**
 * Predicate guard to ensure a new vertex is being added on mouseup
 *
 * Converts the tool instance into an extended type.
 *
 * @param tool The instance of the polygon tool
 */
export const isInsertingPoint = (tool: PolygonTool): tool is PolygonTool & AddingPointContext => (
  tool.currentPath.length === 0 &&
  !!tool.pointOnLine &&
  tool.pointOnLineAnnotation !== null &&
  tool.pointOnLinePath !== null &&
  tool.pointOnLinePosition !== null
)
