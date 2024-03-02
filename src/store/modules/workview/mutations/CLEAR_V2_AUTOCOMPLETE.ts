import { WorkflowMutation } from '@/store/modules/workview/types'
import { V2WorkflowStageInstancePayload } from '@/store/types'

/**
 * Goes through all possible ocurrences of the specified v2 stage instance and clears
 * the `scheduled_to_complete_at` data key.
 *
 * This is done to revert changes done by SET_V2_AUTOCOMPLETE
 */
export const CLEAR_V2_AUTOCOMPLETE: WorkflowMutation<V2WorkflowStageInstancePayload> =
  (state, instance) => {
    if (state.v2SelectedStageInstance?.id === instance.id) {
      state.v2SelectedStageInstance.data.scheduled_to_complete_at = null
    }

    if (state.v2WorkflowItemState?.item_id === instance.id) {
      const itemInstance =
        state.v2WorkflowItemState.current_stage_instances.find(i => i.id === instance.id)
      if (itemInstance) {
        itemInstance.data.scheduled_to_complete_at = null
      }
    }

    if (state.selectedDatasetItem?.workflow_item?.id === instance.item_id) {
      const itemInstance = state.selectedDatasetItem.workflow_item.current_stage_instances
        .find(i => i.id === instance.id)

      if (itemInstance) {
        itemInstance.data.scheduled_to_complete_at = null
      }
    }

    state.datasetItems.filter(i => i.workflow_item?.id === instance.item_id).forEach(i => {
      const itemInstance =
        (i.workflow_item?.current_stage_instances || []).find(i => i.id === instance.id)

      if (itemInstance) {
        itemInstance.data.scheduled_to_complete_at = null
      }
    }
    )
  }
