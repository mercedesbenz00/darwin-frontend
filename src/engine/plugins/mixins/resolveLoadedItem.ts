import { Editor } from '@/engine/editor'
import { StreamView } from '@/engine/models/views'

export const resolveLoadedItem = (editor: Editor) => {
  const { loadedImage, loadedVideo } = editor.activeView
  if (!loadedImage && !loadedVideo) { return }

  let item
  if (loadedImage) {
    item = loadedImage
  } else if (editor.activeView instanceof StreamView) {
    item = editor.activeView.renderingImage
  } else if (loadedVideo) {
    const frame = loadedVideo.frames[editor.activeView.currentFrameIndex]
    item = frame.hqData || frame.lqData
  }
  return item
}
