import { buildLoadedFrame, buildLoadedVideo } from 'test/unit/factories'

import { getInitialState as workviewState } from '@/store/modules/workview'
import { SET_LOADED_VIDEO_FRAME_LOADED } from '@/store/modules/workview/mutations/SET_LOADED_VIDEO_FRAME_LOADED'
import { WorkviewState } from '@/store/modules/workview/state'

let state: WorkviewState
let params: Parameters<typeof SET_LOADED_VIDEO_FRAME_LOADED>[1]

beforeEach(() => { state = workviewState() })

describe('SET_LOADED_VIDEO_FRAME_LOADED', () => {
  it('should save frame loaded status', () => {
    state.loadedVideos = [
      buildLoadedVideo({
        id: 1,
        frames: {
          0: buildLoadedFrame({ hqDataLoaded: false, lqDataLoaded: false })
        }
      })
    ]
    params = {
      datasetVideoId: 1,
      frameIndex: 0,
      frame: buildLoadedFrame({ hqDataLoaded: true, lqDataLoaded: true })
    }
    SET_LOADED_VIDEO_FRAME_LOADED(state, params)
    expect(state.loadedVideos[0].frames[0].hqDataLoaded).toBeTruthy()
    expect(state.loadedVideos[0].frames[0].lqDataLoaded).toBeTruthy()
  })

  it("should not update frame when loaded status didn't change", () => {
    state.loadedVideos = [
      buildLoadedVideo({
        id: 1,
        frames: {
          0: buildLoadedFrame({ hqDataLoaded: true, lqDataLoaded: false })
        }
      })
    ]
    params = {
      datasetVideoId: 1,
      frameIndex: 0,
      frame: buildLoadedFrame({ hqDataLoaded: true, lqDataLoaded: false })
    }
    SET_LOADED_VIDEO_FRAME_LOADED(state, params)
    expect(state.loadedVideos[0].frames[0].hqDataLoaded).toBeTruthy()
    expect(state.loadedVideos[0].frames[0].lqDataLoaded).toBeFalsy()
  })
})
