import { WorkflowMutation, LoadedFrame } from '@/store/modules/workview/types'

type Params = {
  id: number
  loadedFrames: { [key: string]: LoadedFrame }
}

export const PUSH_VIDEO_FRAMES: WorkflowMutation<Params> =
  (state, data) => {
    const idx = state.loadedVideos.findIndex(v => v.id === data.id)
    if (idx >= 0) {
      state.loadedVideos[idx].frames = { ...state.loadedVideos[idx].frames, ...data.loadedFrames }
    }
  }
