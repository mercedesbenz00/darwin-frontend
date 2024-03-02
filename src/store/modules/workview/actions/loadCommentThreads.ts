import { CommentThread } from '@/engine/models'
import { WorkviewAction } from '@/store/modules/workview/types'
import { WorkflowPayload } from '@/store/types/WorkflowPayload'

/**
 * Returns a blank list in tutorial mode.
 *
 * If not on tutorial mode, simply proxies dispatch to comment/loadCommentThreads
 */

const loadCommentThreads: WorkviewAction<WorkflowPayload, CommentThread[]> =
  ({ dispatch, state }, workflow) => {
    if (state.tutorialMode) { return { data: [] } }
    return dispatch('comment/loadCommentThreads', workflow, { root: true })
  }

export default loadCommentThreads
