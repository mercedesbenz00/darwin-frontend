import { UserPayload } from './UserPayload'
import { V2WorkflowStagePayload } from './V2WorkflowStagePayload'

/**
 * Defines shape of the time summary payload returned by the backend, for a dataset item
 */
export type V2DatasetItemTimeSummaryPayload = {
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
      stage_id: V2WorkflowStagePayload['id']
      /** Type of stage this entry is for. 'complete' stages should not appear here. */
      type: V2WorkflowStagePayload['type']
      /** Id of the user this entry is associated to */
      user_id: UserPayload['id']
    }[]
  }
  /**
   * Id of the dataset item this is the summary for
   */
  dataset_item_id: string

  /**
   * List of per-user time summaries for time tracked out of workflow.
   */
  out_of_workflow: {
    duration: number
    type: V2WorkflowStagePayload['type']
    user_id: UserPayload['id']
  }[]
  /* eslint-enable camelcase */
}
