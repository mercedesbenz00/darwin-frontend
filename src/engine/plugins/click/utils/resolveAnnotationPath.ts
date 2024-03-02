import { ToolContext } from '@/engine/managers'
import { EditablePoint, IPoint, Point } from '@/engineCommon/point'

/**
 * Converts the given vanilla path to a valid annotation path.
 * @param context the tool context
 * @param path a list of { x, y } points
 */
export const resolveAnnotationPath = (
  context: ToolContext,
  path: IPoint[]
): EditablePoint<'Image'>[] => {
  const editor = context.editor
  const annotationPath = path.map(point => {
    const imagePoint = new Point<'Image'>(point)
    const canvasPoint = editor.camera.imageViewToCanvasView(imagePoint)
    return new EditablePoint<'Image'>(editor.camera.canvasViewToImageView(canvasPoint))
  })
  return annotationPath
}
