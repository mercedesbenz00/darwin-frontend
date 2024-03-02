import { ActionTree } from 'vuex'

import { RootState } from '@/store/types'

import addUnsavedCommentThread from './actions/addUnsavedCommentThread'
import createComment from './actions/createComment'
import createCommentThread from './actions/createCommentThread'
import loadCommentThreads from './actions/loadCommentThreads'
import loadCommentsForThread from './actions/loadCommentsForThread'
import removeComment from './actions/removeComment'
import removeCommentThread from './actions/removeCommentThread'
import resolveCommentThread from './actions/resolveCommentThread'
import updateComment from './actions/updateComment'
import updateCommentThread from './actions/updateCommentThread'
import { CommentState } from './state'

const actions: ActionTree<CommentState, RootState> = {
  addUnsavedCommentThread,
  createComment,
  createCommentThread,
  loadCommentsForThread,
  loadCommentThreads,
  removeComment,
  removeCommentThread,
  resolveCommentThread,
  updateComment,
  updateCommentThread
}

export default actions
