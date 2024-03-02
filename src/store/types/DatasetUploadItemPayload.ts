export type DatasetUploadItemPayload = {
  /* eslint-disable camelcase */
  filename: string
  path?: string
  tags?: string[]
  fps?: number
  as_frames?: boolean
  extract_views?: boolean
  /* eslint-enable camelcase */
}

export type DatasetUploadItemPayloadV2 = {
  /* eslint-disable camelcase */
  file_name: string
  slot_name?: string
  type?: string
  upload_id?: string
  fps?: number
  path?: string
  tags?: string[]
  as_frames?: boolean
  extract_views?: boolean
  reason?: string
  /* eslint-enable camelcase */
}
