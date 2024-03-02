export type DatasetExportPayload = {
  /* eslint-disable camelcase */
  name: string
  download_url: string | null
  latest: boolean
  metadata: {
    annotation_classes: { id: number, name: string }[]
    annotation_types: { id: number, count: number }[]
    num_images: number
  } | null
  inserted_at: string
  version: number
  /* eslint-enable camelcase */
}
