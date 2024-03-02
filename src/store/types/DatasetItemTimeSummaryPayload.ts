import { UserPayload } from './UserPayload'
import { WorkflowStagePayload } from './WorkflowStagePayload'

/**
 * Defines shape of the time summary payload returned by the backend, for a dataset item
 */
export type DatasetItemTimeSummaryPayload = {
  /* eslint-disable camelcase */

  /**
   * Summary of the current workflow
   */
  current_workflow: {
    /**
     * List of time entries grouped by stage and user
     */
    per_stage_per_user: {
      /** Total time (in seconds) spent by this user on this stage */
      duration: number
      /** Id of the workflow stage payload this entry is associated to */
      stage_id: WorkflowStagePayload['id']
      /** Type of stage this entry is for. 'complete' stages should not appear here. */
      type: WorkflowStagePayload['type']
      /** Id of the user this entry is associated to */
      user_id: UserPayload['id']
    }[]
  }
  /**
   * Id of the dataset item this is the summary for
   */
  dataset_item_id: number

  /**
   * List of per-user time summaries for time tracked out of workflow.
   */
  out_of_workflow: {
    duration: number
    type: WorkflowStagePayload['type']
    user_id: UserPayload['id']
  }[]
  /* eslint-enable camelcase */
}
