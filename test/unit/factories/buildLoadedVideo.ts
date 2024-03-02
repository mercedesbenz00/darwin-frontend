import { LoadedVideo } from '@/store/modules/workview/types'

type LoadedVideoBuildParams = Partial<LoadedVideo>

export const buildLoadedVideo = (params: LoadedVideoBuildParams = {}): LoadedVideo => ({
  id: -1,
  frames: {
    0: {
      seq: 1,
      hqUrl: 'hqurl0',
      lqUrl: 'lqurl0',
      hqData: null,
      lqData: null,
      hqDataLoaded: false,
      lqDataLoaded: false
    },
    1: {
      seq: 2,
      hqUrl: 'hqurl1',
      lqUrl: 'lqurl1',
      hqData: null,
      lqData: null,
      hqDataLoaded: false,
      lqDataLoaded: false
    }
  },
  currentFrameIndex: 0,
  fps: 5,
  ...params
})
