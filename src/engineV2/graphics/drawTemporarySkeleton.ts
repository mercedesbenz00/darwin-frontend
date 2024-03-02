import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { Camera } from '@/engineCommon/camera'
import { CanvasPoint, EditablePoint } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { drawVertex, drawVertexV2 } from './drawVertex'

export const drawTemporarySkeletonV2 = (
  drawFn: DrawCallback,
  view: View,
  initialPoint: CanvasPoint,
  cursorPoint: CanvasPoint,
  annotationClass: AnnotationClass
): void => {
  drawFn((ctx, canvas, draw) => {
    if (!annotationClass) { return }
    if (!annotationClass.annotation_types.includes('skeleton')) { return }

    ctx.strokeStyle = annotationClass.colorRGBAstring
    ctx.lineWidth = 1

    const { x: width, y: height } = cursorPoint.sub(initialPoint)

    if (!annotationClass.metadata.skeleton) { return }
    const { skeleton: { nodes, edges } } = annotationClass.metadata
    for (const edge of edges) {
      const fromNode = nodes.find(node => node.name === edge.from)
      const toNode = nodes.find(node => node.name === edge.to)
      if (!fromNode || !toNode) { continue }

      ctx.moveTo(initialPoint.x + fromNode.x * width, initialPoint.y + fromNode.y * height)
      ctx.lineTo(initialPoint.x + toNode.x * width, initialPoint.y + toNode.y * height)
    }
    ctx.stroke()

    if (!draw) { return }

    ctx.lineJoin = 'round'
    for (const node of nodes) {
      drawVertexV2(
        draw,
        view.camera,
        new EditablePoint({
          x: initialPoint.x + node.x * width,
          y: initialPoint.y + node.y * height
        }),
        null,
        annotationClass.color,
        true,
        false,
        false,
        false
      )
    }
  })
}

/**
 * @deprecated
 */
export const drawTemporarySkeleton = (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  initialPoint: CanvasPoint,
  cursorPoint: CanvasPoint,
  annotationClass: AnnotationClass
): void => {
  if (!annotationClass) { return }
  if (!annotationClass.annotation_types.includes('skeleton')) { return }

  ctx.strokeStyle = annotationClass.colorRGBAstring
  ctx.lineWidth = camera.lineWidth

  const { x: width, y: height } = cursorPoint.sub(initialPoint)

  if (!annotationClass.metadata.skeleton) { return }
  const { skeleton: { nodes, edges } } = annotationClass.metadata
  for (const edge of edges) {
    const fromNode = nodes.find(node => node.name === edge.from)
    const toNode = nodes.find(node => node.name === edge.to)
    if (!fromNode || !toNode) { continue }

    ctx.moveTo(initialPoint.x + fromNode.x * width, initialPoint.y + fromNode.y * height)
    ctx.lineTo(initialPoint.x + toNode.x * width, initialPoint.y + toNode.y * height)
  }
  ctx.stroke()

  ctx.lineJoin = 'round'
  for (const node of nodes) {
    drawVertex(
      ctx,
      camera,
      new EditablePoint({
        x: initialPoint.x + node.x * width,
        y: initialPoint.y + node.y * height
      }),
      null,
      annotationClass.color,
      true,
      false
    )
  }
}
