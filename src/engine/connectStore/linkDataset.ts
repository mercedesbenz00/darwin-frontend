import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { RootState } from '@/store/types'
import { getDatasetHotkeys } from '@/utils'

const setHotkeys = (store: Store<RootState>, editor: Editor): void => {
  const hotkeys = store.state.workview.dataset
    ? getDatasetHotkeys({
      annotationClasses: store.state.aclass.classes,
      dataset: store.state.workview.dataset
    })
    : {}

  editor.hotkeyManager.setHotkeys(hotkeys)
}

export const linkDataset = (store: Store<RootState>, editor: Editor): Function => {
  setHotkeys(store, editor)

  return store.subscribe(mutation => {
    if (mutation.type === 'workview/SET_DATASET') {
      setHotkeys(store, editor)
    }
  })
}
