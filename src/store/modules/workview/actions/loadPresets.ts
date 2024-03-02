import { WorkviewAction } from '@/store/modules/workview/types'
import { PresetPayload } from '@/store/types'

export const loadPresets: WorkviewAction<void, PresetPayload[]> = ({ commit }) => {
  const strPresetItems = window.localStorage.getItem('preset_items')
  let presets: PresetPayload[] = []

  if (strPresetItems) {
    presets = JSON.parse(strPresetItems)
  }

  commit('SET_PRESETS', presets)

  return { data: presets }
}
