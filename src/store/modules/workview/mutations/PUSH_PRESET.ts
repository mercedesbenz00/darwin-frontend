import { WorkflowMutation } from '@/store/modules/workview/types'
import { PresetPayload } from '@/store/types'

export const PUSH_PRESET: WorkflowMutation<PresetPayload> = (state, preset) => {
  const idx = state.presets.findIndex(d => d.id === preset.id)
  if (idx < 0) {
    state.presets.push(preset)
  } else {
    state.presets.splice(idx, 1, preset)
  }
}
