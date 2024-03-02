import { DatasetAnnotatorPayload } from '@/store/types'

import { buildUserPayload } from './buildUserPayload'

type DatasetAnnotatorPayloadBuildParams = Partial<DatasetAnnotatorPayload>

export const buildDatasetAnnotatorPayload = (params: DatasetAnnotatorPayloadBuildParams): DatasetAnnotatorPayload => ({
  id: -1,
  dataset_id: -1,
  score: 0,
  user_id: -1,
  user: buildUserPayload(),
  ...params
})
