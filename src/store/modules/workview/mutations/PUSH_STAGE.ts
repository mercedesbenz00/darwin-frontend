import { WorkflowMutation } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'

/**
 * Push a new workflow stage instance into an active workflow payload
 * which already exists in the store.
 */
export const PUSH_STAGE: WorkflowMutation<WorkflowStagePayload> = (state, data) => {
  // TODO: This is complicated, we should rework our API to keep it flatter.

  // match active workflow
  const item = state.datasetItems.find(i => i.current_workflow_id === data.workflow_id)

  if (!item || !item.current_workflow) { return }

  // match stage instances of the active workflow
  const instances = Object.values(item.current_workflow.stages)
    .find(s => s.some(i => i.id === data.id))
  if (!instances) { return }

  // upsert a stage instance
  const index = instances.findIndex(i => i.id === data.id)
  if (index === -1) {
    instances.push(data)
  } else {
    instances.splice(index, 1, data)
  }

  const isSelectedInstance =
      state.selectedStageInstance &&
      state.selectedStageInstance.id === data.id

  if (isSelectedInstance) { state.selectedStageInstance = data }
}
