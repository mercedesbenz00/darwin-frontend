import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

export const currentPath: Getter<DatasetState, RootState> =
  state => state.datasetItemFilter.path || null
