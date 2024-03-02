import {
  DatasetItemUploadedItemPayload,
  DatasetItemUploadedItemPayloadV2
} from './DatasetUploadedItemPayload'

export type DatasetUploadedItemsPayload = {
  /* eslint-disable camelcase */
  blocked_items: DatasetItemUploadedItemPayload[]
  items: DatasetItemUploadedItemPayload[]
  /* eslint-enable camelcase */
}

export type DatasetUploadedItemsPayloadV2 = {
  /* eslint-disable camelcase */
  blocked_items: DatasetItemUploadedItemPayloadV2[]
  items: DatasetItemUploadedItemPayloadV2[],
  dataset_slug: string
  /* eslint-enable camelcase */
}
