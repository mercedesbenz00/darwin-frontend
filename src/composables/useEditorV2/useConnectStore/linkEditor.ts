import { Store } from 'vuex'

import { Editor } from '@/engineV2/editor'
import { RootState } from '@/store/types'

export const linkEditor = (store: Store<RootState>, editor: Editor): Function => {
  return store.subscribe(mutation => {
    if (mutation.type === 'workview/TOGGLE_MEASURES') {
      editor.viewsList.forEach(view => {
        view.annotationsLayer.changed()
      })
    }

    if (mutation.type === 'workview/SET_CLICKER_EPSILON') {
      editor.callCommand('clicker_tool.apply_clicker_epsilon')
    }

    if (mutation.type === 'workview/SET_ACTIVE_MANIPULATION_PRESET_ID') {
      const presetId = mutation.payload as number | null
      const selectedPreset = store.state.workview.presets.find(preset => {
        return preset.id === presetId
      })
      if (selectedPreset) {
        editor.activeView.setImageFilter({ ...selectedPreset.manipulation })
      }
    }
  })
}
