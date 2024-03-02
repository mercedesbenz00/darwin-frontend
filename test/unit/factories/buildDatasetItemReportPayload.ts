import { DatasetItemReportPayload } from '@/store/modules/datasetItemReports/types'

type Params = Partial<DatasetItemReportPayload>

export const buildDatasetItemReportPayloadStarted = (params: Params = {}): DatasetItemReportPayload => ({
  dataset_id: 1,
  id: 'ff24532f-f49e-44d6-a52e-ae9398c8e746',
  requested_at: '2021-09-13T08:31:43',
  state: 'started',
  team_id: 1,
  updated_at: '2021-09-13T08:31:43',
  ...params
})

export const buildDatasetItemReportPayloadFinished = (params: Params = {}): DatasetItemReportPayload => ({
  dataset_id: 1,
  id: 'ff24532f-f49e-44d6-a52e-ae1348d1e796',
  requested_at: '2021-09-13T08:31:43',
  url: 'http://example.com/s3/ff24532f-f49e-44d6-a52e-ae9398c8e746.csv',
  state: 'finished',
  team_id: 1,
  updated_at: '2021-09-13T08:31:43',
  ...params
})
