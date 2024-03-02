import { LoadedFrame } from '@/store/modules/workview/types'

import { BASE64_IMAGE } from './helpers'

type Params = Partial<LoadedFrame>

export const buildLoadedFrame = (params: Params = {}): LoadedFrame => ({
  seq: 1,
  hqUrl: BASE64_IMAGE,
  lqUrl: BASE64_IMAGE,
  hqData: null,
  lqData: null,
  hqDataLoaded: false,
  lqDataLoaded: false,
  ...params
})
