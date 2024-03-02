import { IView } from '@/engine/models/views/types'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { CanvasPoint, EditablePoint } from '@/engineCommon/point'

import { drawVertex } from './drawVertex'

export const drawTemporarySkeleton = (
  view: IView,
  initialPoint: CanvasPoint,
  cursorPoint: CanvasPoint,
  annotationClass: AnnotationClass
): Path2D | undefined => {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }
  if (!annotationClass) { return }
  if (!annotationClass.annotation_types.includes('skeleton')) { return }

  ctx.strokeStyle = annotationClass.colorRGBAstring
  ctx.lineWidth = view.camera.lineWidth

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
      view.camera,
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
