import { PolylineTool } from '@/engineV2/plugins/polyline/tool'
import { AddingPointContext } from '@/engineV2/plugins/polyline/types'

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
