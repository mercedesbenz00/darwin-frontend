import { WorkviewAction } from '@/store/modules/workview/types'
import { PresetPayload } from '@/store/types'

export const savePreset: WorkviewAction<PresetPayload, PresetPayload> =
  ({ commit, state }, preset) => {
    commit('PUSH_PRESET', preset)
    window.localStorage.setItem('preset_items', `${JSON.stringify(state.presets)}`)
    return { data: preset }
  }
