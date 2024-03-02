export type DatasetAnnotationReportPayload = {
  /* eslint-disable camelcase */
  annotation_time: number
  annotations_approved: number
  annotations_created: number
  dataset_id: number | null
  date: string
  images_annotated: number
  images_approved: number
  images_rejected: number
  user_id: number | null
  /* eslint-enable camelcase */
}
