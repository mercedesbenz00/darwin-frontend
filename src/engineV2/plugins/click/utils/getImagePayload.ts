import { Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { ToolContext } from '@/engineV2/managers'
import { PointMapping } from '@/engineV2/plugins/click/types'

export type ClickImagePayload = {
  imagePayload: {base64: string} | {url: string},
  mapping: PointMapping<'Image'>
}

const getBase64Payload = (context: ToolContext, bbox: Rectangle<'Image'>): ClickImagePayload => {
  // first add a 10% padding around the bounding box on all sides
  const pad10 = new Point<'Image'>({ x: bbox.width * 0.1, y: bbox.height * 0.1 })
  const pbbox = new Rectangle(bbox.topLeft.sub(pad10), bbox.bottomRight.add(pad10))
  const sizeImage = new Point<'Image'>({ x: pbbox.width, y: pbbox.height })

  // keep the longest side under 800 px
  const targetLength = pbbox.width > pbbox.height
    ? new Point<'Image'>({ x: 800, y: pbbox.height / pbbox.width * 800 })
    : new Point<'Image'>({ x: pbbox.width / pbbox.height * 800, y: 800 })

  targetLength.x = Math.ceil(targetLength.x)
  targetLength.y = Math.ceil(targetLength.y)

  const mapping = {
    forward: (point: Point<'Image'>) => point.sub(pbbox.topLeft).mul(targetLength.div(sizeImage)),
    backward: (point: Point<'Image'>) => point.div(targetLength.div(sizeImage)).add(pbbox.topLeft)
  }

  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = targetLength.x
  croppedCanvas.height = targetLength.y
  const croppedCtx = croppedCanvas.getContext('2d')
  if (!croppedCtx) {
    throw new Error("Couldn't get context for cropped canvas")
  }

  // convert the padded bounding box to canvas view, for cropping
  const topLeft = context.editor.activeView.camera.imageViewToCanvasView(pbbox.topLeft)
  const bottomRight = context.editor.activeView.camera.imageViewToCanvasView(
    new Point({
      x: pbbox.topLeft.x + pbbox.width,
      y: pbbox.topLeft.y + pbbox.height
    })
  )
  const size = bottomRight.sub(topLeft)

  croppedCtx.drawImage(context.editor.activeView.mainLayer.canvas,
    topLeft.x, topLeft.y, size.x, size.y,
    0, 0, targetLength.x, targetLength.y
  )

  const base64 = croppedCanvas.toDataURL('image/png').replace(/^data:image\/(png|jpeg);base64,/, '')
  return { imagePayload: { base64 }, mapping: mapping }
}

export const getImagePayload = async (
  context: ToolContext,
  bbox: Rectangle<'Image'>
): Promise<ClickImagePayload> => {
  const { activeView } = context.editor

  const section = await activeView.fileManager.getSection(activeView.currentFrameIndex)
  // TODO: in progress
  if (section?.type as any === 'tiled_image') { return getBase64Payload(context, bbox) }

  if (section) {
    return {
      imagePayload: { url: section.hq_url },
      mapping: {
        forward: (p: Point<'Image'>) => p,
        backward: (p: Point<'Image'>) => p
      }
    }
  }

  throw new Error('Expected image or video to be loaded')
}
