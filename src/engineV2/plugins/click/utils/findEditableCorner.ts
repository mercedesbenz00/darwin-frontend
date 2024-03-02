import { euclideanDistance } from '@/engineCommon/algebra'
import { CanvasPoint } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { Editor } from '@/engineV2/editor'
import { CornerInfo } from '@/engineV2/plugins/click/types'

export const findEditableCorner = (
  editor: Editor,
  currentCrop: Rectangle<'Image'>,
  point: CanvasPoint
): CornerInfo | undefined => {
  const corners: CornerInfo[] = [
    { corner: currentCrop.topLeftEditable, position: 'top-left' },
    { corner: currentCrop.topRightEditable, position: 'top-right' },
    { corner: currentCrop.bottomRightEditable, position: 'bottom-right' },
    { corner: currentCrop.bottomLeftEditable, position: 'bottom-left' }
  ]

  for (const { corner, position } of corners) {
    const canvasPoint = editor.activeView.camera.imageViewToCanvasView(corner)
    if (euclideanDistance(point, canvasPoint) < 5.5) {
      return { corner, position }
    }
  }
}
