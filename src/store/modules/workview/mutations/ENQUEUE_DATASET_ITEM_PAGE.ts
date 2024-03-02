import { enqueuePage, Page } from '@/components/WorkView/BottomBar/pageRegistry'
import { WorkflowMutation } from '@/store/modules/workview/types'

export const ENQUEUE_DATASET_ITEM_PAGE: WorkflowMutation<Page> =
  (state, payload) => enqueuePage(state.datasetItemPageRegistry, payload)
