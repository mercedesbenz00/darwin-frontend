import { Store } from 'vuex'

import { Editor } from '@/engineV2/editor'
import { RootState } from '@/store/types'

export const linkDatasetItem = (store: Store<RootState>, editor: Editor): Function => {
  // @Watch('editor.activeView.isPdfItem')
  // onPdfItem (value: boolean) {
  //   if (!value) { return }

  //   if (this.$store.getters['features/isFeatureEnabled']('DOCUMENTS')) {
  //     this.$store.commit('workview/SET_VIDEO_ANNOTATION_DURATION', 1)
  //   }
  // }

  editor.itemManager.setCurrentItem(store.getters['workview/v2SelectedDatasetItem'])

  return store.subscribe(mutation => {
    if (mutation.type === 'workview/SET_V2_SELECTED_DATASET_ITEM') {
      if (editor.itemManager.currentItem?.id !== mutation.payload) {
        editor.itemManager.setCurrentItem(store.getters['workview/v2SelectedDatasetItem'])
      }
    }
  })
}
