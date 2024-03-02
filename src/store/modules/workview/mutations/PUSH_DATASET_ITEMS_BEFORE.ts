import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

type Params = { items: DatasetItemPayload[], id: number }

export const PUSH_DATASET_ITEMS_BEFORE: WorkflowMutation<Params> =
  (state, params) => {
    const { items, id: beforeId } = params
    const newIds = items.map(d => d.id)
    const datasetItems = state.datasetItems.filter(d => !newIds.includes(d.id) || d.id === beforeId)
    const idx = datasetItems.findIndex((item) => item.id === beforeId)
    if (idx < 0) {
      throw new Error(`Cannot find existing dataset item with ${beforeId}`)
    }

    const beforeIdExisting = newIds.includes(beforeId)
    if (beforeIdExisting) {
      datasetItems.splice(idx, 1, ...items)
    } else {
      datasetItems.splice(idx, 0, ...items)
    }

    state.datasetItems = datasetItems
  }
