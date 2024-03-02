/* eslint-disable camelcase */

import { V2WorkflowPayload } from './V2WorkflowPayload'
import { V2WorkflowStageInstancePayload } from './V2WorkflowStageInstancePayload'

/**
 * Shape of the backend response for a single workflow item.
 *
 * A workflow item is an "istance" of a V2 workflow, applied to a dataset item.
 * To affect a dataset item in the /workview, it needs a workflow.
 */
export type V2WorkflowItemPayload = {
  id: string,
  inserted_at: string
  /**
   * The backend does not render the stage as part of this payload.
   * The stage can instead be looked up from the workflow field.
   */
  current_stage_instances: Omit<V2WorkflowStageInstancePayload, 'stage'>[]
  dataset_item_id: number
  designated_assignees: Record<string, number>
  updated_at: string
  workflow: V2WorkflowPayload
  workflow_id: V2WorkflowPayload['id']
}
