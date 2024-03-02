import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

type Params = { items: DatasetItemPayload[], id: number }

export const PUSH_DATASET_ITEMS_AFTER: WorkflowMutation<Params> =
  (state, params) => {
    const { items, id: afterId } = params
    const newIds = items.map(d => d.id)
    const datasetItems = state.datasetItems.filter(d => !newIds.includes(d.id) || d.id === afterId)
    const idx = datasetItems.findIndex((item) => item.id === afterId)
    if (idx < 0) {
      throw new Error(`Cannot find existing dataset item with ${afterId}`)
    }

    const afterIdExisting = newIds.includes(afterId)
    if (afterIdExisting) {
      datasetItems.splice(idx, 1, ...items)
    } else {
      if (idx === datasetItems.length - 1) {
        datasetItems.push(...items)
      } else {
        datasetItems.splice(idx + 1, 0, ...items)
      }
    }

    state.datasetItems = datasetItems
  }
