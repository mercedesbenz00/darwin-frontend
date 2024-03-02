import { V2DatasetFolderPayload } from '@/store/types'
type Params = Partial<V2DatasetFolderPayload>

export const buildV2DatasetFolderPayload =
  (params: Params = {}): V2DatasetFolderPayload => ({
    path: '/',
    filtered_item_count: 0,
    unfiltered_item_count: 0,
    dataset_id: -1,
    thumbnail_url: null,
    children: [],
    ...params
  })
