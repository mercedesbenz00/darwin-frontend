import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'
import { applyItemChanges, resolveUpdates } from '@/utils/datasetChannel'

/**
 * Resolves the list of received dataset items with items already in the store
 *
 * - if received item is already in the store, it is updated
 * - if received item is not in the store, it is pushed
 * - if received item is excluded by current store filters, it is not added
 *
 * ## Caveats
 *
 * The class filter cannot be applied as the frontend has now knowledge of which
 * classes item is annotated with. Only the backend knows that. Due to this,
 * pushed items will get added to the store even if class filters are excluded.
 *
 * ## Folders
 *
 * Folders are also updated as well as possible.
 * - old folder counts are decremented
 * - new folder counts are incremented
 * - folders are added or removed if necessary
 */
export const PUSH_DATASET_ITEMS: DatasetMutation<DatasetItemPayload[]> = (state, newItems) => {
  const changes = resolveUpdates(
    state.datasetItems,
    newItems,
    state.datasetItemFilter,
    state.folderEnabled
  )

  state.datasetItems = applyItemChanges(changes, state.datasetItems)
  if (state.selectedAll) {
    state.selectedItemIds = state.datasetItems.map(i => i.id)
  }
}
