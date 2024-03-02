import { DatasetImagePayload } from '@/store/types'

import { buildImagePayload } from '.'

type Params = Partial<DatasetImagePayload>

export const buildDatasetImagePayload = (params: Params = {}): DatasetImagePayload => ({
  dataset_id: -1,
  dataset_video_id: null,
  id: 1,
  image: buildImagePayload({}),
  seq: 1,
  set: 1,
  ...params
})
