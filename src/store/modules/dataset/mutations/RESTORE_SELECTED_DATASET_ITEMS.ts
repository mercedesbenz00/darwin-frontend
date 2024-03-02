import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetItemStatus, DatasetItemPayload } from '@/store/types'
import { STAGE_TYPE_TO_ITEM_STATUS } from '@/utils/datasetItem'

import { PUSH_DATASET_ITEMS } from './PUSH_DATASET_ITEMS'

class MutationError extends Error {
  static prefix = 'dataset/RESTORE_SELECTED_DATASET_ITEMS'
  constructor (message: string) {
    super(`[${MutationError.prefix}]: ${message}`)
  }
}

const resolveOriginalStatus = (item: DatasetItemPayload) => {
  const { current_workflow: workflow } = item

  if (workflow) {
    const stages = Object.values(workflow.stages).flat()
    const stage = stages.find(s => s.number === workflow.current_stage_number)
    if (stage) { return STAGE_TYPE_TO_ITEM_STATUS[stage.type] }

    throw new MutationError('Workflow is invalid. Has no current stage in payload')
  }

  if (item.dataset_image && item.dataset_image.image && !item.dataset_image.image.uploaded) {
    return DatasetItemStatus.uploading
  }

  if (item.dataset_video && item.dataset_video.processed_frames < item.dataset_video.total_frames) {
    return DatasetItemStatus.processing
  }

  return DatasetItemStatus.new
}

export const RESTORE_SELECTED_DATASET_ITEMS: DatasetMutation<void> = (state) => {
  const affectedItems = state.selectedAll
    ? state.datasetItems
    : state.datasetItems.filter(i => state.selectedItemIds.includes(i.id))

  PUSH_DATASET_ITEMS(
    state,
    affectedItems.map(i => ({ ...i, status: resolveOriginalStatus(i) }))
  )
}
