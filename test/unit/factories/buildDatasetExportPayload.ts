import { DatasetExportPayload } from '@/store/types'

type Params = Partial<DatasetExportPayload>

export const buildDatasetExportPayload = (params: Params = {}): DatasetExportPayload => ({
  name: '',
  latest: false,
  metadata: null,
  download_url: null,
  inserted_at: '2000-01-01T00:00:00',
  version: 1,
  ...params
})
