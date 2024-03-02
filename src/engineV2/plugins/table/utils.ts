import { CanvasPoint, EditablePoint } from '@/engineCommon/point'
import { ToolContext } from '@/engineV2/managers'

import { TableTool } from './tool'

export const isOnRowOrColumn = (
  point: CanvasPoint,
  tool: TableTool,
  context: ToolContext
): { type: 'column' | 'row', offset: number } | undefined => {
  const { rowOffsets, colOffsets, initialImagePoint, cursorImagePoint } = tool

  if (
    rowOffsets !== undefined &&
    colOffsets !== undefined &&
    initialImagePoint &&
    cursorImagePoint
  ) {
    const tableSize = cursorImagePoint.sub(initialImagePoint)
    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(point)

    for (let r = 0; r < rowOffsets.length; r++) {
      const rowOffset = rowOffsets.at(r)
      if (!rowOffset) { continue }

      const left = new EditablePoint<'Image'>({
        x: initialImagePoint.x,
        y: initialImagePoint.y + tableSize.y * rowOffset
      })
      const right = new EditablePoint<'Image'>({
        x: initialImagePoint.x + tableSize.x,
        y: initialImagePoint.y + tableSize.y * rowOffset
      })

      if (context.editor.activeView.isPointOnPath(imagePoint, [left, right])) {
        return { type: 'row', offset: r }
      }
    }

    for (let c = 0; c < colOffsets.length; c++) {
      const colOffset = colOffsets.at(c)
      if (!colOffset) { continue }

      const top = new EditablePoint<'Image'>({
        x: initialImagePoint.x + tableSize.x * colOffset,
        y: initialImagePoint.y
      })
      const bottom = new EditablePoint<'Image'>({
        x: initialImagePoint.x + tableSize.x * colOffset,
        y: initialImagePoint.y + tableSize.y
      })
      if (context.editor.activeView.isPointOnPath(imagePoint, [top, bottom])) {
        return { type: 'column', offset: c }
      }
    }
  }
}
