import { GetterTree, Getter } from 'vuex'

import { CommentThread } from '@/engine/models'
import { RootState } from '@/store/types'

import { CommentState } from './state'

const currentCommentThread: Getter<CommentState, RootState> =
  (state): CommentThread | null =>
    state.commentThreads.find(t => t.isSelected) || null

const selectedUnresolvedCommentThread: Getter<CommentState, RootState> =
  (state): CommentThread | null =>
    state.commentThreads.find(t => t.isSelected && !t.resolved) || null

const getters: GetterTree<CommentState, RootState> = {
  currentCommentThread,
  selectedUnresolvedCommentThread
}

export default getters
