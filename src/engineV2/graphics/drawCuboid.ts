import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA } from '@/utils'

import { drawSegment, drawSegmentV2 } from './drawSegment'
import { fillPath, fillPathV2 } from './fillPath'
import { strokePath, strokePathV2 } from './strokePath'

export function drawCuboidV2 (
  drawFn: DrawCallback,
  camera: Camera,
  cuboidPath: EditableImagePoint[],
  frontPath: EditableImagePoint[],
  backPath: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted: boolean = false,
  isSelected: boolean = false
): void {
  // Connect front and back vertices
  for (let i = 0; i < 4; i += 1) {
    drawSegmentV2(drawFn, camera, frontPath[i], backPath[i], color, filter, isSelected)
  }
  // Fill cuboid path
  fillPathV2(drawFn, cuboidPath, color, filter, isHighlighted, isSelected)
  // Refill front path, so it is more evident
  fillPathV2(drawFn, frontPath, color, filter, isHighlighted, isSelected)
  // Stroke front and back faces
  strokePathV2(drawFn, camera, frontPath, color, filter, isSelected)
  strokePathV2(drawFn, camera, backPath, color, filter, isSelected)
}

/**
 * @deprecated
 */
export function drawCuboid (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  cuboidPath: EditableImagePoint[],
  frontPath: EditableImagePoint[],
  backPath: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted: boolean = false,
  isSelected: boolean = false
): void {
  // Connect front and back vertices
  for (let i = 0; i < 4; i += 1) {
    drawSegment(camera, ctx, frontPath[i], backPath[i], color, filter, isSelected)
  }
  // Fill cuboid path
  fillPath(camera, ctx, cuboidPath, color, filter, isHighlighted, isSelected)
  // Refill front path, so it is more evident
  fillPath(camera, ctx, frontPath, color, filter, isHighlighted, isSelected)
  // Stroke front and back faces
  strokePath(camera, ctx, frontPath, color, filter, isSelected)
  strokePath(camera, ctx, backPath, color, filter, isSelected)
}
