import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

export const UNSHIFT_DATASET_ITEMS: WorkflowMutation<DatasetItemPayload[]> =
  (state, items: DatasetItemPayload[]) => {
    const newIds = items.map(d => d.id)
    const datasetItems = state.datasetItems.filter(d => !newIds.includes(d.id))
    state.datasetItems = [...items, ...datasetItems]
  }
