import { WorkflowMutation } from '@/store/modules/workview/types'
import { V2WorkflowStageInstancePayload } from '@/store/types'
import { unixNowMs, unixToIso } from '@/utils'
import { AUTO_COMPLETE_USER_TIME_MS } from '@/utils/workflows'

export const SET_V2_AUTOCOMPLETE: WorkflowMutation<V2WorkflowStageInstancePayload> =
  (state, instance) => {
    const nowMs = unixNowMs()
    const completesAtMs = nowMs + AUTO_COMPLETE_USER_TIME_MS
    const completesAtIso = unixToIso(completesAtMs)

    if (state.v2SelectedStageInstance?.id === instance.id) {
      state.v2SelectedStageInstance.data.scheduled_to_complete_at = completesAtIso
    }

    if (state.v2WorkflowItemState?.item_id === instance.item_id) {
      const itemInstance =
        state.v2WorkflowItemState.current_stage_instances.find(i => i.id === instance.id)
      if (itemInstance) {
        itemInstance.data.scheduled_to_complete_at = completesAtIso
      }
    }

    if (state.selectedDatasetItem?.workflow_item?.id === instance.item_id) {
      const itemInstance = state.selectedDatasetItem.workflow_item.current_stage_instances
        .find(i => i.id === instance.id)

      if (itemInstance) {
        itemInstance.data.scheduled_to_complete_at = completesAtIso
      }
    }

    state.datasetItems.filter(i => i.workflow_item?.id === instance.item_id).forEach(i => {
      const itemInstance =
        (i.workflow_item?.current_stage_instances || []).find(i => i.id === instance.id)

      if (itemInstance) {
        itemInstance.data.scheduled_to_complete_at = completesAtIso
      }
    }
    )
  }
