import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

/**
 * Returns integer specifying the implicit number of selected items
 *
 * This can be the total number of explicitly selected items, or the total number
 * of filtered items in the dataset, if we're in selectAll mode
 */
export const selectedItemCount: Getter<DatasetState, RootState> = state => {
  const counts = state.datasetDetails.find(d => d.id === state.currentDataset.id)
  return state.selectedAll && !!counts
    ? counts.item_count
    : state.selectedItemIds.length
}
