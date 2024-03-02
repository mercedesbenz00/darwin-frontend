import { View } from '@/engine/models'
import { ImagePoint } from '@/engineCommon/point'
import { RGBA, rgbaString } from '@/utils'

const DEFAULT_PADDING = 4
const MIN_FONT_SIZE = 1

const fitFontSize = (
  text: string,
  boxWidth: number,
  boxHeight: number,
  fontFamily: string
): number => {
  const boxCanvas: HTMLCanvasElement = document.createElement('canvas')
  boxCanvas.width = boxWidth
  boxCanvas.height = boxHeight
  const ctx = boxCanvas.getContext('2d')!

  for (let fontSize = 300; fontSize > MIN_FONT_SIZE; fontSize -= 1) {
    ctx.font = `${fontSize}px ${fontFamily}`
    const measurement = ctx.measureText(text)
    if (measurement.width <= boxWidth) {
      return fontSize
    }
  }
  boxCanvas.remove()
  return MIN_FONT_SIZE
}

export function drawText (
  view: View,
  offset: ImagePoint,
  boxWidth: number,
  boxHeight: number,
  text: string,
  color: RGBA,
  textColor: RGBA,
  fontFamily: string,
  staticFontSize?: number
): Path2D | undefined {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }

  const fontSize = staticFontSize || fitFontSize(text, boxWidth, boxHeight, fontFamily)
  ctx.font = `${fontSize}px ${fontFamily}`
  const measurement = ctx.measureText(text)
  const fontHeight = measurement.actualBoundingBoxAscent - measurement.actualBoundingBoxDescent
  const fontWidth = measurement.actualBoundingBoxRight - measurement.actualBoundingBoxLeft
  const width = staticFontSize ? (fontWidth + DEFAULT_PADDING) : boxWidth

  ctx.save()
  view.camera.imageViewCtxToCanvasViewCtx(ctx)
  ctx.fillStyle = rgbaString(color, 0.8)
  ctx.fillRect(offset.x, offset.y, width, boxHeight)
  ctx.restore()

  ctx.save()
  view.camera.imageViewCtxToCanvasViewCtx(ctx)
  ctx.fillStyle = rgbaString(textColor)

  if (staticFontSize) {
    ctx.fillText(
      text,
      offset.x + DEFAULT_PADDING / 2,
      offset.y + measurement.actualBoundingBoxAscent + (boxHeight - fontHeight) / 2
    )
  } else {
    ctx.fillText(
      text,
      offset.x + (boxWidth - fontWidth) / 2,
      offset.y + measurement.actualBoundingBoxAscent + (boxHeight - fontHeight) / 2
    )
  }
  ctx.restore()
}
