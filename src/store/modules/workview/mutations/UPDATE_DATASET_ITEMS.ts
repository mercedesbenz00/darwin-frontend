import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

/**
 * From specified new items, takes only those already present in state and
 * updates their data.
 *
 * The mutation does not care if the new item status is different from currently
 * filtered statuses. Since it's being called when we get socket messages about
 * item updates, and it's mostly due to auto-complete triggering, caring about
 * this would cause items to randomly disappear from the bottom bar, or not get
 * updated at all, depending on the implementation.
 */
export const UPDATE_DATASET_ITEMS: WorkflowMutation<DatasetItemPayload[]> = (state, newItems) => {
  newItems.forEach(item => {
    const idx = state.datasetItems.findIndex(d => d.id === item.id)
    if (idx < 0) { return }
    state.datasetItems.splice(idx, 1, item)
  })
}
