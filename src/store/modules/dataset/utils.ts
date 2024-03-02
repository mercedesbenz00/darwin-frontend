import {
  DatasetItemPayload,
  DatasetItemStatus,
  V2DatasetItemPayload,
  WorkflowPayload
} from '@/store/types'
import { STAGE_TYPE_TO_ITEM_STATUS } from '@/utils/datasetItem'

class MutationError extends Error {
  static prefix = 'dataset/RESTORE_SELECTED_DATASET_ITEMS'
  constructor (message: string) {
    super(`[${MutationError.prefix}]: ${message}`)
  }
}

type DatasetItemPayloadWithWorkflow = DatasetItemPayload & {
  /* eslint-disable camelcase */
  current_workflow: WorkflowPayload
  current_workflow_id: number
  /* eslint-enable camelcase */
}

export const itemHasWorkflow = (
  item: DatasetItemPayload
): item is DatasetItemPayloadWithWorkflow => !!item.current_workflow

export const allItemsHaveWorkflows = (
  items: DatasetItemPayload[]
): items is DatasetItemPayloadWithWorkflow[] => items.every(itemHasWorkflow)

export const allItemsNotNew = (
  items: DatasetItemPayload[]
): boolean => {
  return !items.some(item =>
    item.status === DatasetItemStatus.new
  )
}

export const resolveOriginalStatus = (item: V2DatasetItemPayload) => {
  const { current_workflow: workflow } = item

  if (workflow) {
    const stages = Object.values(workflow.stages).flat()
    const stage = stages.find(s => s.number === workflow.current_stage_number)
    if (stage) { return STAGE_TYPE_TO_ITEM_STATUS[stage.type] }

    throw new MutationError('Workflow is invalid. Has no current stage in payload')
  }

  return DatasetItemStatus.new
}
