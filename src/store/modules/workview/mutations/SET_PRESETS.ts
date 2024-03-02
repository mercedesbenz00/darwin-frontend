import { WorkflowMutation } from '@/store/modules/workview/types'
import { PresetPayload } from '@/store/types'

export const SET_PRESETS: WorkflowMutation<PresetPayload[]> = (
  state,
  data: PresetPayload[]
) => {
  state.presets = data
}
