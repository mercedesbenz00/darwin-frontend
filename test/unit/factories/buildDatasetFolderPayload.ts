import { DatasetFolderPayload } from '@/store/types'
type Params = Partial<DatasetFolderPayload>

export const buildDatasetFolderPayload =
  (params: Params = {}): DatasetFolderPayload => ({
    path: '/',
    direct_item_count: 0,
    direct_item_count_filtered: 0,
    dataset_id: -1,
    url: null,
    children: [],
    ...params
  })
