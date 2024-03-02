import { DatasetItemFilenamePayload, DatasetItemType } from '@/store/types'
type Params = Partial<DatasetItemFilenamePayload>

export const buildDatasetItemFilenamePayload =
  (params: Params = {}): DatasetItemFilenamePayload => ({
    filename: '1.jpg',
    type: DatasetItemType.image,
    isDicom: false,
    isPdf: false,
    ...params
  })
