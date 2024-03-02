import { mergeQueue } from '@/components/WorkView/BottomBar/pageRegistry'
import { WorkflowMutation } from '@/store/modules/workview/types'

export const MERGE_DATASET_ITEM_PAGE_REGISTRY: WorkflowMutation<void> = state =>
  mergeQueue(state.datasetItemPageRegistry)
