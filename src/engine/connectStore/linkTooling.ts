import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { RootState } from '@/store/types'

export const linkTooling = (store: Store<RootState>, editor: Editor): Function => {
  editor.autoActivateTool()

  const toolMutations = [
    'workview/PRESELECT_CLASS_ID'
  ]

  return store.subscribe(mutation => {
    if (toolMutations.includes(mutation.type)) {
      editor.autoActivateTool()
    }
  })
}
