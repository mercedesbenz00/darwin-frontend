import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import {
  DatasetItemPayload,
  RootState
} from '@/store/types'

/**
 * Returns the next (by list index) dataset item in state, for the selected dataset item
 */
export const nextDatasetItem: Getter<WorkviewState, RootState> =
  (state): DatasetItemPayload | null => {
    const { datasetItems, selectedDatasetItem } = state
    if (!selectedDatasetItem) { return null }

    const index = datasetItems.findIndex(i => i.id === selectedDatasetItem.id)
    if (index === -1) { return null }
    return datasetItems[index + 1] || null
  }
