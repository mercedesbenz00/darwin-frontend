import {
  DatasetUploadItemPayload,
  DatasetUploadItemPayloadV2
} from './DatasetUploadItemPayload'

export type DatasetItemUploadedItemPayload = DatasetUploadItemPayload & {
  /* eslint-disable camelcase */
  dataset_item_id: number
  /* eslint-enable camelcase */
}

export type DatasetItemUploadedItemPayloadV2 = {
  slots: DatasetUploadItemPayloadV2[]
  id: string
  name: string
  path?: string
  tags?: string[]
}
