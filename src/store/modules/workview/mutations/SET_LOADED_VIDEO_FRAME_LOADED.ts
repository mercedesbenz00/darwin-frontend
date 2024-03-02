import { LoadedFrame, WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetVideoPayload } from '@/store/types/DatasetVideoPayload'

type Params = {
  datasetVideoId: DatasetVideoPayload['id']
  frameIndex: number
  frame: LoadedFrame
}

export const SET_LOADED_VIDEO_FRAME_LOADED: WorkflowMutation<Params> =
  (state, { datasetVideoId, frame, frameIndex }) => {
    const idx = state.loadedVideos.findIndex(video => video.id === datasetVideoId)
    if (idx < 0) { return }

    const { hqDataLoaded, lqDataLoaded } = frame
    const loadedVideo = state.loadedVideos[idx]
    const existingFrame = loadedVideo.frames[frameIndex]

    if (
      existingFrame?.hqDataLoaded === hqDataLoaded &&
      existingFrame?.lqDataLoaded === lqDataLoaded
    ) { return }

    const newFrames = {
      ...loadedVideo.frames,
      [frameIndex]: {
        ...existingFrame,
        hqDataLoaded,
        lqDataLoaded
      }
    }

    state.loadedVideos.splice(idx, 1, { ...loadedVideo, frames: newFrames })
  }
