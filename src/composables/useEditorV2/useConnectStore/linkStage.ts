import { Store } from 'vuex'

import { Editor } from '@/engineV2/editor'
import { RootState } from '@/store/types'

export const linkStage = (store: Store<RootState>, editor: Editor): Function => {
  return store.subscribe(mutation => {
    switch (mutation.type) {
    case 'workview/REMOVE_STAGE_ANNOTATIONS':
      editor.viewsList.forEach(view => {
        view.annotationManager.deleteAnnotations(mutation.payload)
      })
      break
    }
  })
}
