import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { RootState } from '@/store/types'

export const linkThreads = (store: Store<RootState>, editor: Editor): Function => {
  const commentMutations = [
    'comment/ADD_THREAD',
    'comment/DELETE_COMMENT_THREAD',
    'comment/DESELECT_ALL_COMMENT_THREADS',
    'comment/FOCUS_COMMENT_THREAD',
    'comment/SELECT_COMMENT_THREAD',
    'comment/SET_THREAD',
    'comment/SET_THREADS',
    'comment/REPLACE_UNSAVED_THREAD',
    'comment/RESOLVE_COMMENT_THREAD',
    'comment/UNFOCUS_ALL_COMMENT_THREADS'
  ]
  return store.subscribe(mutation => {
    if (commentMutations.includes(mutation.type)) {
      editor.viewsList.forEach(view => {
        view.commentManager.setCommentThreads()
      })
    }
  })
}
