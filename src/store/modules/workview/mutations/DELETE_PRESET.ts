import { WorkflowMutation } from '@/store/modules/workview/types'

export const DELETE_PRESET: WorkflowMutation<number> = (state, id) => {
  state.presets = state.presets.filter(d => d.id !== id)
}
