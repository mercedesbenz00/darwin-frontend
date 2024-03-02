import { DatasetItemPayload, DatasetItemStatus, DatasetItemType } from '@/store/types'

import { buildDatasetImagePayload } from './buildDatasetImagePayload'

type Params = Partial<DatasetItemPayload>

export const buildDatasetItemPayload =
  (params: Params = {}): DatasetItemPayload => ({
    archived: false,
    archived_reason: null,
    current_workflow_id: null,
    current_workflow: null,
    dataset_id: -1,
    dataset_image_id: 1,
    dataset_image: buildDatasetImagePayload({ id: 1 }),
    dataset_video_id: null,
    dataset_video: null,
    file_size: 10000,
    filename: '',
    height: 100,
    id: -1,
    inserted_at: '2000-01-01',
    labels: [],
    priority: 0,
    seq: -1,
    set: -1,
    status: DatasetItemStatus.new,
    updated_at: '2000-01-01',
    width: 100,
    path: '/',
    type: DatasetItemType.image,
    ...params
  })
