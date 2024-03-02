import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

/**
 * Push a collection of dataset items into the store
 *
 * Replaces items matched by id
 * Leaves previously existing items, currently unmatched by id as they are.
 */
export const PUSH_DATASET_ITEMS: WorkflowMutation<DatasetItemPayload[]> =
  (state, items: DatasetItemPayload[]) => {
    const newIds = items.map(d => d.id)
    const datasetItems = state.datasetItems.filter(d => !newIds.includes(d.id))
    datasetItems.push(...items)
    state.datasetItems = datasetItems
  }
