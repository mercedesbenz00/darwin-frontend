/* eslint-disable camelcase */
export type DatasetFolderPayload = {
  dataset_id: number
  path: string
  direct_item_count: number
  direct_item_count_filtered: number
  url: string | null

  // The below fields are not from the backend
  children?: DatasetFolderPayload[]
}
/* eslint-enable camelcase */
