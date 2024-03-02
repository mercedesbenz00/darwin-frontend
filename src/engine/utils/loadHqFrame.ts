import { View } from '@/engine/models'
import { LoadedFrame, RenderableImage } from '@/store/modules/workview/types'

const updateEditorCameraImage = (frame: LoadedFrame, view: View): void => {
  if (
    view.loadedVideo?.id === view.currentItem?.dataset_video_id &&
    view.currentFrameIndex === frame.seq &&
    frame.hqData
  ) {
    view.camera.setImage(frame.hqData.data, false)
    view.mainLayer.changed()
  }
}

export const loadHqFrame = (
  frame: LoadedFrame,
  frameIndex: number,
  view: View
): Promise<RenderableImage | null> =>
  new Promise<RenderableImage | null>((resolve, reject) => {
    if (frame.hqData) {
      if (view.loadedVideo) {
        updateEditorCameraImage(frame, view)
        resolve(frame.hqData)
      } else {
        frame.hqData.data.remove()
        frame.hqData = null
        frame.hqDataLoaded = false
        resolve(null)
      }
      return
    }
    const hqImage = new Image()
    hqImage.crossOrigin = 'anonymous'

    hqImage.onload = (): void => {
      if (!view.loadedVideo) {
        // Should remove the loaded image if this image is not for the current video
        hqImage.remove()
        resolve(null)
        return
      }

      // Clear listeners as unnecessary
      hqImage.onload = null
      hqImage.onerror = null

      const hqData: RenderableImage = {
        data: hqImage,
        rawData: null,
        transformedData: null,
        lastWindowLevels: view.windowLevelsRange,
        lastColorMap: 'default'
      }
      frame.hqData = hqData
      frame.hqDataLoaded = true

      view.store.commit('workview/SET_LOADED_VIDEO_FRAME_LOADED', {
        datasetVideoId: view.loadedVideo.id,
        frameIndex,
        frame
      })

      updateEditorCameraImage(frame, view)
      resolve(hqData)
    }

    hqImage.onerror = (): void => reject(new Error('Image failed to load.'))
    hqImage.src = frame.hqUrl
  })
