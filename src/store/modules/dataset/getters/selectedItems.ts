import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

export const selectedItems: Getter<DatasetState, RootState> = state =>
  state.datasetItems.filter(i => state.selectedItemIds.includes(i.id))
