import { WorkviewAction } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'

const updateStageParents: WorkviewAction<WorkflowStagePayload, void> =
  async ({ dispatch, state }, stage) => {
    const item = state.datasetItems.find(i => i.current_workflow_id === stage.workflow_id)
    if (!item) { return }
    await Promise.all([
      dispatch('reloadDatasetItem', item),
      dispatch('loadDatasetItemCounts', { openWorkMode: false })
    ])
  }

export default updateStageParents
