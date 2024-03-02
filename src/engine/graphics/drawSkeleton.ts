import { View } from '@/engine/models'
import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { RGBA } from '@/utils'

import { drawVertex } from './drawVertex'
import { strokeStyle } from './strokeStyle'

const roundedRectWithText = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  text: string
): void => {
  ctx.save()
  ctx.strokeStyle = 'rgba(0, 0, 0, 1)'
  ctx.fillStyle = 'rgba(0, 0, 0, 1)'
  ctx.beginPath()
  ctx.moveTo(x, y + radius)
  ctx.lineTo(x, y + height - radius)
  ctx.arcTo(x, y + height, x + radius, y + height, radius)
  ctx.lineTo(x + width - radius, y + height)
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius)
  ctx.lineTo(x + width, y + radius)
  ctx.arcTo(x + width, y, x + width - radius, y, radius)
  ctx.lineTo(x + radius, y)
  ctx.arcTo(x, y, x, y + radius, radius)
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.font = '12px Muli'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'
  ctx.fillText(text, x + width / 2, y + height / 2)
  ctx.restore()
}

const drawVertexDescriptor = (
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  node: { name: string, point: EditableImagePoint },
  width: number = 13,
  height: number = 20
): void => {
  if (!node.point.isHighlighted) { return }
  const canvasPoint = camera.imageViewToCanvasView(node.point)
  roundedRectWithText(
    ctx,
    canvasPoint.x + 10,
    canvasPoint.y - 10,
    width + 7 * node.name.length,
    height,
    3,
    node.name)
}

export const drawSkeleton = (
  view: View,
  nodes: { name: string, point: EditableImagePoint, occluded: boolean }[],
  edges: { from: string, to: string }[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected = false
): Path2D | undefined => {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }
  const OCCULDED_COLOR: RGBA = { r: 100, g: 100, b: 100, a: 1 }

  ctx.lineWidth = view.camera.lineWidth

  const path = new Path2D()
  for (const edge of edges) {
    const fromNode = nodes.find(node => node.name === edge.from)
    const toNode = nodes.find(node => node.name === edge.to)
    if (!fromNode || !toNode) { continue }

    const canvasFromNode = view.camera.imageViewToCanvasView(fromNode.point)
    const canvasToNode = view.camera.imageViewToCanvasView(toNode.point)

    const pathEdge = new Path2D()
    if (fromNode.occluded || toNode.occluded) {
      ctx.strokeStyle = strokeStyle(OCCULDED_COLOR, filter, false, isSelected)
    } else {
      ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
    }
    pathEdge.moveTo(canvasFromNode.x, canvasFromNode.y)
    pathEdge.lineTo(canvasToNode.x, canvasToNode.y)
    ctx.stroke(pathEdge)
    path.addPath(pathEdge)
  }

  ctx.lineJoin = 'round'

  for (const node of nodes) {
    drawVertexDescriptor(ctx, view.camera, node)
    if (node.occluded) {
      ctx.strokeStyle = strokeStyle(OCCULDED_COLOR, filter, false, isSelected)
      drawVertex(ctx, view.camera, node.point, filter, OCCULDED_COLOR, true, true, true)
    } else {
      ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
      drawVertex(ctx, view.camera, node.point, filter, color, true)
    }
  }

  return path
}
