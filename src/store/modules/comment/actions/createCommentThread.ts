import { ActionContext } from 'vuex'

import { getCommentThread } from '@/store/modules/comment/serializer'
import { CommentState } from '@/store/modules/comment/state'
import { CommentAction, CommentThread } from '@/store/modules/comment/types'
import { RootState } from '@/store/types'
import { createCommentThread as request } from '@/utils/backend'

type CreateCommentThread = CommentAction<CommentThread>

const resolveWorkflowId = async (context: ActionContext<CommentState, RootState>) => {
  const { dispatch, rootState } = context

  const workflowResult = await dispatch(
    'workview/resolveStageForSelectedItem',
    undefined,
    { root: true }
  )

  if (workflowResult.error) { return workflowResult }
  const { selectedDatasetItem: item } = rootState.workview
  if (!item || !item.current_workflow_id) {
    throw new Error('comment/createCommentThread: Failed at resolving workflow.')
  }

  return { data: item.current_workflow_id }
}

const handleWorkflow = async (
  context: ActionContext<CommentState, RootState>,
  thread: CommentThread
) => {
  const { data: workflowId, error } = await resolveWorkflowId(context)
  if (error) { return { error } }

  const { boundingBox, comments, frameIndex } = thread

  const response = await request({
    boundingBox,
    frameIndex,
    comments: comments.map(c => ({ body: c.body })),
    workflowId
  })

  if ('error' in response) { return response }

  const newCommentThread: CommentThread = {
    ...getCommentThread(response.data),
    isSelected: true,
    isHighlighted: false,
    annotationBoundingBox: thread.annotationBoundingBox
  }

  context.commit('REPLACE_UNSAVED_THREAD', newCommentThread)
  return { data: newCommentThread }
}

const createCommentThread: CreateCommentThread = (context, thread) => {
  const { boundingBox } = thread
  if (!boundingBox) {
    throw new Error('comment/createCommentThread: Tried to create invalid comment thread')
  }

  return handleWorkflow(context, thread)
}

export default createCommentThread
