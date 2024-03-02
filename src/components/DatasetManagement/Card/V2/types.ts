import {
  DatasetItemPayload,
  V2DatasetItemPayload,
  V2DatasetFolderPayload
} from '@/store/types'

export type DatasetFolderCardProps = {
  data: V2DatasetFolderPayload
  readonly: boolean
  urlPrefix: string | null
}

export type DatasetItemCardProps = {
  data: DatasetItemPayload,
  dataV2: V2DatasetItemPayload
}
