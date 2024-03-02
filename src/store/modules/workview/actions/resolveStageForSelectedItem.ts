import { isDefaultAutoComplete } from '@/components/WorkView/utils'
import { WorkviewAction } from '@/store/modules/workview/types'
import { StoreActionPayload } from '@/store/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'

import { assignStage } from './assignStage'

class ActionError extends Error {
  constructor (message: string) {
    super(`workview/resolveStageForSelectedItem: ${message}`)
  }
}

/**
 * Resolves workflow for item and self-assigns stage to team member,
 * when they try to annotate prior to assigning the stage to themselves.
 *
 * This function assumes the following (and throws, if assumption is wrong)
 *
 * - there is a selected dataset item
 * - there is a signed in user
 * - the signed in user is a member of the current team
 *
 * It will, if necessary
 *
 * - instantiate the default workflow for an item
 * - self-assign the first approapriate stage within that workflow (usually the first stage)
 *
 * If any of these things are not necessary, that step will be a no-op.
 *
 * If there is already an active workflow and the
 * current stage is already assigned, it will be a no-op.
 *
 * If any of the backend requests fail with an error code, the error will be parsed and returned.
 *
 * If any sucessful backend call does not result in the expected local state,
 * this is a bug and the action will throw.
 */
const resolveStageForSelectedItem: WorkviewAction<void, WorkflowStagePayload> = async (context) => {
  const { dispatch, state, rootState } = context
  const { selectedDatasetItem: item, selectedStageInstance: stage } = state
  // shouldn't happen, sanity check
  if (!item) { throw new ActionError('Tying to annotate/comment with no item selected.') }

  // if stage is already assigned, no need to do anything else
  if (stage && stage.assignee_id && !isDefaultAutoComplete(item)) { return { data: stage } }

  // from this point on, the process will fail if user is not authorized to self-assign
  // the UI should not allow the user to perform this action if they are not able, so no
  // auth checks should be needed here specifically

  // figure out who to assign the stage to
  // this check is first since it makes no network requests
  const { profile: user } = rootState.user
  if (!user) { throw new ActionError('Trying to annotate/comment while signed out') }

  const member = rootState.team.memberships.find(m => m.user_id === user.id)
  if (!member) { throw new ActionError("Trying to annotate/comment in someone else's team.") }

  // create workflow for item if necessary
  if (!item.current_workflow || isDefaultAutoComplete(item)) {
    const createWorkflowResult = await dispatch('createWorkflow', item)
    if (createWorkflowResult.error) { return createWorkflowResult }
  }

  const { selectedDatasetItem: resolvedItem } = state

  // recompute active workflow from store - it MUST exist now, or there's a bug
  if (!resolvedItem || !resolvedItem.current_workflow) {
    const message = "Couldn't resolve workflow for selected item when self-assigning."
    throw new ActionError(message)
  }

  // figure out if stage needs self-assigning
  const stageNumber = resolvedItem.current_workflow.current_stage_number
  const stages = resolvedItem.current_workflow.stages[stageNumber]
  const targetStage = stages.find(s => s.assignee_id === null)
  if (!targetStage) { throw new ActionError("Couldn't resolve stage when self-assigning") }

  const payload: StoreActionPayload<typeof assignStage> = {
    stage: targetStage,
    userId: member.user_id
  }

  const assignResult = await dispatch('assignStage', payload)
  if (assignResult.error) { return assignResult }

  return { data: targetStage }
}

export default resolveStageForSelectedItem
