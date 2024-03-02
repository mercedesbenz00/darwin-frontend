export default class DrawCircle {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  centerX: number
  centerY: number
  circleRadius: number
  circleStartAngle: number
  circlePercentage: number
  currentPercentage: number

  constructor (props: { canvas: HTMLCanvasElement, context: CanvasRenderingContext2D }) {
    this.canvas = props.canvas
    this.context = props.context

    this.centerX = this.canvas.width / 2
    this.centerY = this.canvas.height / 2

    this.circleRadius = 7
    this.circleStartAngle = 1.5 * Math.PI // top
    this.circlePercentage = 0 // end
    this.currentPercentage = 0 // current til end

    if (!this.canvas || !this.context) { return }

    this.drawCircle = this.drawCircle.bind(this)
  }

  drawTo (percentage: number): number {
    return (2 * Math.PI) * percentage / 100 + (1.5 * Math.PI)
  }

  drawCircle (color: string): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.beginPath()
    this.context.moveTo(this.centerX, this.centerY)
    this.context.arc(
      this.centerX,
      this.centerY,
      this.circleRadius,
      this.circleStartAngle,
      this.drawTo(this.circlePercentage)
    )
    this.context.closePath()
    this.context.fillStyle = color
    this.context.fill()
  }

  render (percentage: number, color: string = '#FFFFFF'): void {
    this.drawCircle(color)
    this.circlePercentage = percentage
    this.currentPercentage += (this.currentPercentage + 1)

    if (this.currentPercentage < this.circlePercentage + 1) {
      requestAnimationFrame(() => this.render(this.currentPercentage, color))
    }
  }
}
