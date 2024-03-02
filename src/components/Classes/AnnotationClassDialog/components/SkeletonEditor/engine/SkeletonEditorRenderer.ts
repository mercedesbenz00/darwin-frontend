import SkeletonEditorEngine from './SkeletonEditorEngine'
import { SkeletonEdgeType } from './types'

export default class SkeletonEditorRenderer {
  private engine!: SkeletonEditorEngine

  constructor (engine: SkeletonEditorEngine) {
    this.engine = engine
  }

  private drawEdge (ctx: CanvasRenderingContext2D, edge: SkeletonEdgeType): void {
    const startPoint = edge.nodes[0].position
    const endPoint = edge.nodes[1].position

    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(endPoint.x, endPoint.y)
  }

  render (): void {
    const { canvas, edges, strokeColor, width, height } = this.engine
    if (!canvas) { return }
    const ctx = canvas.getContext('2d')
    if (!ctx) { return }
    ctx.clearRect(0, 0, width, height)

    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = strokeColor

    ctx.beginPath()
    edges.forEach(edge => this.drawEdge(ctx, edge))
    ctx.stroke()
    ctx.closePath()
  }
}
