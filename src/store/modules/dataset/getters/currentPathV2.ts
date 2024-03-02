import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

export const currentPathV2: Getter<DatasetState, RootState> =
  state => {
    return state.datasetItemFilterV2.item_path_prefix || null
  }
