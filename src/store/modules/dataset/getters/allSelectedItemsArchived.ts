import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { DatasetItemStatus, RootState } from '@/store/types'

/**
 * Returns boolean indicating if all currently selected items in dataset management are archived
 *
 * If that is the case, certain actions (perma-delete and restore) become available.
 */
export const allSelectedItemsArchived: Getter<DatasetState, RootState> = (state): boolean => {
  const isAllSelected = state.selectedAll
  const itemCounts = state.datasetDetails.find(d => d.id === state.currentDataset.id)
  const items = state.datasetItems

  if (isAllSelected) {
    // if the current filter allows for only archived items, then we don't have to
    // wait for everything to get loaded to know we will only affect archived items with an action
    const filteringArchivedOnly =
      state.datasetItemFilter.statuses?.every(s => s === DatasetItemStatus.archived)
    if (filteringArchivedOnly) { return true }

    // if the current filter allows for other items, then we need to wait for all items to load to
    // be sure all of them are archived
    const allItemsLoaded = itemCounts?.item_count === items.length
    const allItemsArchived = items.every(i => i.archived)
    if (allItemsLoaded && allItemsArchived) { return true }
  }

  if (!isAllSelected) {
    // if we're not selecting all, then the only check to take is that all selected items are
    // archived
    const selectedItems = items.filter(i => state.selectedItemIds.includes(i.id))
    const allSelectedItemsArchived = selectedItems.every(i => i.archived)

    return (allSelectedItemsArchived)
  }

  return false
}
