import { WorkflowMutation } from '@/store/modules/workview/types'

export const SET_ACTIVE_MANIPULATION_PRESET_ID: WorkflowMutation<number | null> = (
  state,
  presetId: number | null
) => {
  state.activePresetId = presetId
}
