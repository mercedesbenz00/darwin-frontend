import { WorkviewAction } from '@/store/modules/workview/types'

export const deletePreset: WorkviewAction<number, number> =
  ({ commit, state }, presetId) => {
    commit('DELETE_PRESET', presetId)
    window.localStorage.setItem('preset_items', `${JSON.stringify(state.presets)}`)
    return { data: presetId }
  }
