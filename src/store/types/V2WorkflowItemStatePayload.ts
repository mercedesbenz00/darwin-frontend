import { V2WorkflowCommandPayload } from './V2WorkflowCommandPayload'
import { V2WorkflowItemPayload } from './V2WorkflowItemPayload'
import { V2WorkflowPayload } from './V2WorkflowPayload'
import { V2WorkflowStageInstancePayload } from './V2WorkflowStageInstancePayload'

/* eslint-disable camelcase */

export type V2WorkflowItemStatePayload = {
  commands: V2WorkflowCommandPayload[]
  current_stage_instances: V2WorkflowStageInstancePayload[]
  previous_stage_instances: V2WorkflowStageInstancePayload[]
  item_id: V2WorkflowItemPayload['id']
  /**
   * A map where keys are stage names and values are user ids
   *
   * If a key for a stage name is present in this map, it means the specified
   * user is a designated assignee of the stage.
   *
   * The designated assignee becomes the assignee of the stage instance when the
   * item enters that stage of the workflow.
   */
  designated_assignees: Record<string, number>
  workflow: V2WorkflowPayload
}

/* eslint-enable camelcase */
