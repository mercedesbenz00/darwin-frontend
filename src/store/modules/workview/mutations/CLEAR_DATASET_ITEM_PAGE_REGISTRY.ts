import { WorkflowMutation } from '@/store/modules/workview/types'

export const CLEAR_DATASET_ITEM_PAGE_REGISTRY: WorkflowMutation<void> = (state) => {
  state.datasetItemPageRegistry = { queue: [], requested: [] }
}
