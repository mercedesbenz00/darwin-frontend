/* eslint-disable camelcase */
export type V2DatasetFolderPayload = {
  dataset_id: number
  path: string
  filtered_item_count: number
  unfiltered_item_count: number
  thumbnail_url: string | null

  // The below fields are not from the backend
  children?: V2DatasetFolderPayload[]
}
/* eslint-enable camelcase */
