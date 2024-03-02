import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemPayload, V2DatasetItemPayload } from '@/store/types'

/**
   * Set specified dataset item as the selected item
   */
export const SET_SELECTED_DATASET_ITEM: WorkflowMutation<DatasetItemPayload | null> = (
  state, data
) => {
  state.selectedDatasetItem = data

  // V2 data reset
  state.v2SelectedStage = null
  state.v2SelectedStageInstance = null
  state.v2WorkflowItemState = null
}

export const SET_V2_SELECTED_DATASET_ITEM: WorkflowMutation<V2DatasetItemPayload['id'] | null> = (
  state, id
) => {
  state.selectedDatasetItemV2Id = id
}
