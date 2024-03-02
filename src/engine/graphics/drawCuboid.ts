import { View } from '@/engine/models'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { RGBA } from '@/utils'

import { drawSegment } from './drawSegment'
import { fillPath } from './fillPath'
import { strokePath } from './strokePath'

export function drawCuboid (
  view: View,
  cuboidPath: EditableImagePoint[],
  frontPath: EditableImagePoint[],
  backPath: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted: boolean = false,
  isSelected: boolean = false
) {
  // Connect front and back vertices
  for (let i = 0; i < 4; i += 1) {
    drawSegment(view, frontPath[i], backPath[i], color, filter, isSelected)
  }
  // Fill cuboid path
  fillPath(view, cuboidPath, color, filter, isHighlighted, isSelected)
  // Refill front path, so it is more evident
  fillPath(view, frontPath, color, filter, isHighlighted, isSelected)
  // Stroke front and back faces
  strokePath(view, frontPath, color, filter, isSelected)
  strokePath(view, backPath, color, filter, isSelected)
}
