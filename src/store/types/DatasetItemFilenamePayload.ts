import { DatasetItemType } from './DatasetItemType'

export type DatasetItemFilenamePayload = {
  filename: string
  type: DatasetItemType
  isDicom: boolean
  isPdf: boolean
}
