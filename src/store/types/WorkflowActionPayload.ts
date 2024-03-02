import { StageType } from './StageType'
import { WorkflowActionType } from './WorkflowActionType'
import { WorkflowStagePayload } from './WorkflowStagePayload'
import { WorkflowStageTemplatePayload } from './WorkflowStageTemplatePayload'

/**
 * Represents a single workflow action in the backend database,
 * with a few additional fields preloaded for simplicity.
 *
 * These fields are
 *
 * - workflow_template_id
 * - workflow_template_name
 *
 * Reasons these fields are not loaded asynchronously via association are (2020/09/03)
 *
 * - the association is workflow, so it would have to go through action.workflow.template
 * - we have no other place in the app currently requiring us to directly load workflows
 *
 * If the reasons are ever eliminated, we should re-evaluate
 */
export type WorkflowActionPayload = {
  /* eslint-disable camelcase */
  annotations: number
  from_stage_id: WorkflowStagePayload['id']
  from_stage_template_id: WorkflowStageTemplatePayload['id']
  from_type: StageType
  id: number
  inserted_at: string
  to_stage_template_id: WorkflowStageTemplatePayload['id']
  to_type: StageType
  type: WorkflowActionType
  user_id: number
  workflow_id: number
  workflow_template_id: number
  workflow_template_name: string
  /* eslint-enable camelcase */
}
