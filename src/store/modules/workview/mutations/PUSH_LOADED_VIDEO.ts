import { LoadedFrame, LoadedVideo, WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetVideoPayload } from '@/store/types/DatasetVideoPayload'
import { VideoFramePayload } from '@/store/types/VideoFramePayload'

type Params = {
  payload: DatasetVideoPayload
  loadedFrames: VideoFramePayload[]
}

export const PUSH_LOADED_VIDEO: WorkflowMutation<Params> =
  (state, data) => {
    const frames: { [k: number]: LoadedFrame } = {}
    for (let i = 0; i < data.loadedFrames.length; i++) {
      const frame = data.loadedFrames[i]
      frames[i] = {
        hqUrl: frame.hq_key,
        lqUrl: frame.lq_key,
        seq: i,
        hqData: null,
        lqData: null,
        hqDataLoaded: false,
        lqDataLoaded: false
      }
    }

    const video: LoadedVideo = {
      id: data.payload.id,
      frames,
      currentFrameIndex: 0,
      fps: data.payload.fps
    }

    const idx = state.loadedVideos.findIndex(v => v.id === data.payload.id)
    if (idx < 0) {
      state.loadedVideos.push(video)
    } else {
      state.loadedVideos.splice(idx, 1, video)
    }
  }
