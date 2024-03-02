import { V2DatasetItemFilter } from '@/store/types'

type Params = Partial<V2DatasetItemFilter>

export const buildV2DatasetItemFilter =
  (params: Params = {}): V2DatasetItemFilter => ({ ...params })
