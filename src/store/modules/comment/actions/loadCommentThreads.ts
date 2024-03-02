import { getCommentThread } from '@/store/modules/comment/serializer'
import { CommentAction, CommentThread } from '@/store/modules/comment/types'
import { WorkflowPayload } from '@/store/types'
import { loadCommentThreads as request } from '@/utils/backend'

/**
 * Loads comment threads for a workflow.
 */
const loadCommentThreads: CommentAction<WorkflowPayload, CommentThread[]> =
  async ({ commit, state }, workflow) => {
    const response = await request({ workflowId: workflow.id })

    if ('data' in response) {
      const commentThreads = response.data.map(payload => getCommentThread(payload))
      commit('SET_THREADS', commentThreads)
    }

    return { data: state.commentThreads }
  }

export default loadCommentThreads
