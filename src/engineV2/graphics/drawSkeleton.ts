import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA } from '@/utils'

import { drawVertex, drawVertexV2 } from './drawVertex'
import { strokeStyle } from './strokeStyle'

const roundedRectWithText = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  text: string,
  scale: number
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
  ctx.font = `${12 / scale}px Muli`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'
  ctx.fillText(text, x + width / 2, y + height / 2)
  ctx.restore()
}

const DESCRIPTOR_WIDTH = 13
const DESCRIPTOR_HEIGHT = 20

const drawVertexDescriptor = (
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  node: { name: string, point: EditableImagePoint },
  width: number = DESCRIPTOR_WIDTH,
  height: number = DESCRIPTOR_HEIGHT,
  isV2: boolean = false
): void => {
  if (!node.point.isHighlighted) { return }
  const scale = isV2 ? camera.scale : 1
  const canvasPoint = isV2 ? node.point : camera.imageViewToCanvasView(node.point)
  roundedRectWithText(
    ctx,
    canvasPoint.x + (10 / scale),
    canvasPoint.y - (10 / scale),
    (width + 7 * node.name.length) / scale,
    height / scale,
    3 / scale,
    node.name,
    scale
  )
}

export const drawSkeletonV2 = (
  drawFn: DrawCallback,
  camera: Camera,
  nodes: { name: string, point: EditableImagePoint, occluded: boolean }[],
  edges: { from: string, to: string }[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelectedProp = false
): void => {
  drawFn((ctx, canvas, draw, isDynamic) => {
    const isSelected = isSelectedProp && !!isDynamic

    const OCCULDED_COLOR: RGBA = { r: 100, g: 100, b: 100, a: 1 }

    ctx.lineWidth = 1 / camera.scale

    const path = new Path2D()
    for (const edge of edges) {
      const fromNode = nodes.find(node => node.name === edge.from)
      const toNode = nodes.find(node => node.name === edge.to)
      if (!fromNode || !toNode) { continue }

      const canvasFromNode = fromNode.point
      const canvasToNode = toNode.point

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

    if (!draw) { return }

    for (const node of nodes) {
      if (isDynamic) {
        drawVertexDescriptor(ctx, camera, node, DESCRIPTOR_WIDTH, DESCRIPTOR_HEIGHT, true)
      }
      if (node.occluded) {
        ctx.strokeStyle = strokeStyle(OCCULDED_COLOR, filter, false, isSelected)
        drawVertexV2(draw, camera, node.point, filter, OCCULDED_COLOR, true, false, true)
      } else {
        ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
        drawVertexV2(draw, camera, node.point, filter, color, true, false, false)
      }
    }
  })
}

/**
 * @deprecated
 */
export const drawSkeleton = (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  nodes: { name: string, point: EditableImagePoint, occluded: boolean }[],
  edges: { from: string, to: string }[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected = false
): Path2D | undefined => {
  const OCCULDED_COLOR: RGBA = { r: 100, g: 100, b: 100, a: 1 }

  ctx.lineWidth = camera.lineWidth

  const path = new Path2D()
  for (const edge of edges) {
    const fromNode = nodes.find(node => node.name === edge.from)
    const toNode = nodes.find(node => node.name === edge.to)
    if (!fromNode || !toNode) { continue }

    const canvasFromNode = camera.imageViewToCanvasView(fromNode.point)
    const canvasToNode = camera.imageViewToCanvasView(toNode.point)

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
    drawVertexDescriptor(ctx, camera, node)
    if (node.occluded) {
      ctx.strokeStyle = strokeStyle(OCCULDED_COLOR, filter, false, isSelected)
      drawVertex(ctx, camera, node.point, filter, OCCULDED_COLOR, true, true, true)
    } else {
      ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
      drawVertex(ctx, camera, node.point, filter, color, true)
    }
  }

  return path
}
