import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { V2WorkflowPayload } from '@/store/types'

type Payload = {
  assignedItems: number
  workflowId: string
}

export const SET_WORKFLOW_ASSIGNED_ITEMS: WorkflowMutation<Payload> =
  (state, { workflowId, assignedItems }) => {
    state.workflows = state.workflows
      .map((workflow: V2WorkflowPayload) => {
        if (workflow.id !== workflowId) { return workflow }

        const currentAssignedItems = workflow.assigned_items || 0

        return { ...workflow, assigned_items: currentAssignedItems + assignedItems }
      })
  }
