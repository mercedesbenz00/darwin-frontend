import { DatasetItemStatus } from './DatasetItemStatus'
import { WorkflowStagePayload } from './WorkflowStagePayload'

export type WorkflowPayload = {
  /* eslint-disable camelcase */
  current_stage_number: number
  current_workflow_stage_template_id: number
  dataset_item_id: number
  id: number
  stages: { [id: number]: WorkflowStagePayload[] }
  status: DatasetItemStatus.archive |
    DatasetItemStatus.annotate |
    DatasetItemStatus.review |
    DatasetItemStatus.complete |
    // this is just for compatibility
    DatasetItemStatus.consensus_entrypoint |
    DatasetItemStatus.logic
  workflow_template_id: number
  /* eslint-enable camelcase */
}
