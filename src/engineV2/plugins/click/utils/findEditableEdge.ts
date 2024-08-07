import { CanvasPoint, ImagePoint } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { Editor } from '@/engineV2/editor'

const THRESHOLD = 5.5

export const findEditableEdge = (
  editor: Editor,
  currentCrop: Rectangle<'Image'>,
  point: CanvasPoint
): ImagePoint | undefined => {
  const { topLeftEditable, bottomRightEditable } = currentCrop
  const { x: left, y: top } = editor.activeView.camera.imageViewToCanvasView(topLeftEditable)
  const { x: right, y: bottom } =
    editor.activeView.camera.imageViewToCanvasView(bottomRightEditable)
  const { x, y } = point
  const imagePoint = editor.activeView.camera.canvasViewToImageView(point)

  if (top - THRESHOLD < y && y < bottom + THRESHOLD) {
    if (Math.abs(left - x) < THRESHOLD) { return imagePoint }
    if (Math.abs(right - x) < THRESHOLD) { return imagePoint }
  }

  if (left - THRESHOLD < x && x < right + THRESHOLD) {
    if (Math.abs(top - y) < THRESHOLD) { return imagePoint }
    if (Math.abs(bottom - y) < THRESHOLD) { return imagePoint }
  }

  return undefined
}
