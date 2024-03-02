import {
  DatasetImagePayload,
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetItemType
} from '@/store/types'

import { sfh } from './datasets'

const baseImage: DatasetImagePayload = {
  id: 1,
  dataset_id: sfh.id,
  dataset_video_id: null,
  seq: 1,
  set: 1,
  image: {
    id: 1,
    key: '',
    height: 100,
    width: 100,
    url: '',
    external: false,
    uploaded: true,
    original_filename: 'foo.png',
    thumbnail_url: ''
  }
}

export const baseItem: DatasetItemPayload = {
  id: 1,
  seq: 1,
  set: 1,
  inserted_at: '',
  updated_at: '',
  status: DatasetItemStatus.new,
  current_workflow: null,
  current_workflow_id: null,
  dataset_id: sfh.id,
  dataset_image: baseImage,
  archived: false,
  archived_reason: null,
  dataset_image_id: baseImage.id,
  dataset_video_id: null,
  dataset_video: null,
  file_size: 500,
  filename: 'foo.png',
  height: 100,
  width: 100,
  labels: [],
  path: '/',
  priority: 1,
  type: DatasetItemType.image
}

export const datasetItemBuilder =
  (params: Partial<DatasetItemPayload> = {}): DatasetItemPayload => ({
    ...baseItem,
    inserted_at: new Date().toUTCString(),
    updated_at: new Date().toUTCString(),
    ...params
  })

export const items = [
  { ...baseItem, id: 1, seq: 1 },
  { ...baseItem, id: 2, seq: 2 },
  { ...baseItem, id: 3, seq: 3 },
  { ...baseItem, id: 4, seq: 4 },
  { ...baseItem, id: 5, seq: 5 },
  { ...baseItem, id: 6, seq: 6 },
  { ...baseItem, id: 7, seq: 7 },
  { ...baseItem, id: 8, seq: 8 },
  { ...baseItem, id: 9, seq: 9 }
]
