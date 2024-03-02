import { buildDatasetVideoPayload, buildLoadedFrame, buildLoadedVideo, buildVideoFramePayload } from 'test/unit/factories'

import { getInitialState as workviewState } from '@/store/modules/workview'
import { PUSH_LOADED_VIDEO } from '@/store/modules/workview/mutations/PUSH_LOADED_VIDEO'
import { WorkviewState } from '@/store/modules/workview/state'

let state: WorkviewState
let params: Parameters<typeof PUSH_LOADED_VIDEO>[1]

beforeEach(() => { state = workviewState() })

describe('PUSH_LOADED_VIDEO', () => {
  it('should push new loaded video', () => {
    state.loadedVideos = []
    params = {
      payload: buildDatasetVideoPayload({ id: 1, fps: 10 }),
      loadedFrames: [
        buildVideoFramePayload({
          hq_key: 'hq-url',
          lq_key: 'lq-url'
        })
      ]
    }
    PUSH_LOADED_VIDEO(state, params)
    expect(state.loadedVideos).toHaveLength(1)
    expect(state.loadedVideos[0]).toEqual(
      buildLoadedVideo({
        id: 1,
        frames: {
          0: buildLoadedFrame({
            hqUrl: 'hq-url',
            lqUrl: 'lq-url',
            seq: 0,
            hqData: null,
            lqData: null,
            hqDataLoaded: false,
            lqDataLoaded: false
          })
        },
        currentFrameIndex: 0,
        fps: 10
      })
    )
  })

  it('should replace existing loaded video', () => {
    state.loadedVideos = [buildLoadedVideo({ id: 1 })]
    params = {
      payload: buildDatasetVideoPayload({ id: 1, fps: 10 }),
      loadedFrames: [
        buildVideoFramePayload({
          hq_key: 'hq-url',
          lq_key: 'lq-url'
        })
      ]
    }
    PUSH_LOADED_VIDEO(state, params)
    expect(state.loadedVideos).toHaveLength(1)
    expect(state.loadedVideos[0]).toEqual(
      buildLoadedVideo({
        id: 1,
        frames: {
          0: buildLoadedFrame({
            hqUrl: 'hq-url',
            lqUrl: 'lq-url',
            seq: 0,
            hqData: null,
            lqData: null,
            hqDataLoaded: false,
            lqDataLoaded: false
          })
        },
        currentFrameIndex: 0,
        fps: 10
      })
    )
  })
})
