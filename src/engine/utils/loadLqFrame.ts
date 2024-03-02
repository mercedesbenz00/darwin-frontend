import { View } from '@/engine/models'
import { LoadedFrame, RenderableImage } from '@/store/modules/workview/types'

const updateEditorCameraImage = (frame: LoadedFrame, view: View): void => {
  if (
    view.loadedVideo?.id === view.currentItem?.dataset_video_id &&
    view.currentFrameIndex === frame.seq &&
    frame.lqData
  ) {
    view.camera.setImage(frame.hqData ? frame.hqData.data : frame.lqData.data, false)
    view.mainLayer.changed()
  }
}

export const loadLqFrame = (
  frame: LoadedFrame,
  frameIndex: number,
  view: View
): Promise<RenderableImage | null> =>
  new Promise<RenderableImage | null>((resolve, reject) => {
    if (frame.lqData) {
      if (view.loadedVideo) {
        resolve(frame.lqData)
        updateEditorCameraImage(frame, view)
      } else {
        frame.lqData.data.remove()
        frame.lqData = null
        frame.lqDataLoaded = false
        resolve(null)
      }
      return
    }
    const lqImage = new Image()
    lqImage.crossOrigin = 'anonymous'

    lqImage.onload = (): void => {
      if (!view.loadedVideo) {
        // Should remove the loaded image if this image is not for the current video
        lqImage.remove()
        resolve(null)
        return
      }

      // Clear listeners as unnecessary
      lqImage.onload = null
      lqImage.onerror = null

      const lqData: RenderableImage = {
        data: lqImage,
        rawData: null,
        transformedData: null,
        lastWindowLevels: view.windowLevelsRange,
        lastColorMap: 'default'
      }
      frame.lqData = lqData
      frame.lqDataLoaded = true
      if (view.loadedVideo) {
        view.store.commit('workview/SET_LOADED_VIDEO_FRAME_LOADED', {
          datasetVideoId: view.loadedVideo.id,
          frameIndex,
          frame
        })
      }

      updateEditorCameraImage(frame, view)
      resolve(lqData)
    }

    lqImage.onerror = (): void => reject(new Error('Image failed to load.'))
    lqImage.src = frame.lqUrl
  })
