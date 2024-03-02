import { DatasetItemFilter } from '@/store/types'

type Params = Partial<DatasetItemFilter>

export const buildDatasetItemFilter =
  (params: Params = {}): DatasetItemFilter => ({ ...params })
