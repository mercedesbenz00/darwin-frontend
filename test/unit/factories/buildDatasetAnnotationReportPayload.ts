import { DatasetAnnotationReportPayload } from '@/store/types'

type Params = Partial<DatasetAnnotationReportPayload>

export const buildDatasetAnnotationReportPayload =
(params: Params): DatasetAnnotationReportPayload => ({
  annotation_time: 0,
  annotations_approved: 0,
  annotations_created: 0,
  dataset_id: null,
  date: '',
  images_annotated: 0,
  images_approved: 0,
  images_rejected: 0,
  user_id: null,
  ...params
})
