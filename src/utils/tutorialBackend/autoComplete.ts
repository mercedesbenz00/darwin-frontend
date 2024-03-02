import {
  DatasetItemStatus,
  DatasetItemPayload,
  WorkflowPayload,
  WorkflowTemplatePayload,
  ReviewStatus
} from '@/store/types'
import { STAGE_TYPE_TO_WORKFLOW_STATUS } from '@/utils/datasetItem'

import TutorialError from './TutorialError'
import { State } from './state'

type PendingUpdateCallback = (i: DatasetItemPayload, s: State) => void

const pendingUpdates: { [id: number]: PendingUpdateCallback } = {}

/**
 * Schedule an update call for an item, which will run when the item is next requested by the app.
 *
 * There can be only one scheduled update per item.
 *
 * This is used to simulate auto-completion done on the actual backend.
 */
export const scheduleUpdate = (item: DatasetItemPayload, callback: PendingUpdateCallback) => {
  pendingUpdates[item.id] = callback
}

/**
 * Clear a scheduled pending update from an item
 */
export const clearPendingUpdate = (item: DatasetItemPayload) => {
  delete pendingUpdates[item.id]
}

/**
 * Execute pending update on an item.
 *
 * Each pending update can only be called once, so once executed, it is removed.
 */
export const pushPendingUpdate = (item: DatasetItemPayload, state: State) => {
  pendingUpdates[item.id] && pendingUpdates[item.id](item, state)
  delete pendingUpdates[item.id]
}

const getWorkflow = (item: DatasetItemPayload): WorkflowPayload => {
  const { current_workflow: workflow } = item
  if (!workflow) { throw new TutorialError('Tried to advance invalid item - no workflow') }
  return workflow
}

const getWorkflowTemplate = (state: State, workflow: WorkflowPayload): WorkflowTemplatePayload => {
  const workflowTemplate = state.workflowTemplates.find(t => t.id === workflow.workflow_template_id)
  if (!workflowTemplate) {
    throw new TutorialError('Tried to advance invalid item - invalid workflow template')
  }
  return workflowTemplate
}

/**
 * Simulates advancing of a workflow in a similar way how the backend would do it
 *
 * - update workflow current stage number, template id, status
 * - delete annotations already in next stage
 * - copy annotations from previous stage to next stage
 * - update associated item status
 *
 * The key difference is, since there is no concept of annotation actors on the frontend yet,
 * those are not managed in any way.
 */
export const advanceItem = (item: DatasetItemPayload, state: State) => {
  const workflow = getWorkflow(item)
  const workflowTemplate = getWorkflowTemplate(state, workflow)

  const { current_stage_number: currentNumber } = workflow
  const nextNumber = currentNumber + 1
  const nextStageTemplate =
    workflowTemplate.workflow_stage_templates.find(t => t.stage_number === nextNumber)

  if (!nextStageTemplate) { return }

  const currentStage = workflow.stages[currentNumber][0]
  currentStage.completed = true
  currentStage.completes_at = null

  const shouldArchive = (
    currentStage.metadata.review_status === ReviewStatus.Archived ||
    (currentStage.metadata.review_status === ReviewStatus.Approved && currentStage.skipped)
  )

  if (shouldArchive) {
    item.status = DatasetItemStatus.archived
    item.archived = true
    item.archived_reason = currentStage.skipped_reason
    return
  }

  workflow.current_stage_number = nextStageTemplate.stage_number
  workflow.current_workflow_stage_template_id = nextStageTemplate.id
  workflow.status = STAGE_TYPE_TO_WORKFLOW_STATUS[nextStageTemplate.type]
  item.status = STAGE_TYPE_TO_WORKFLOW_STATUS[nextStageTemplate.type]

  const nextStage = workflow.stages[nextNumber][0]

  // copy stage data

  nextStage.skipped = currentStage.skipped
  nextStage.skipped_reason = currentStage.skipped_reason
  nextStage.metadata = currentStage.metadata

  // copy annotations
  // NOTE: Assumes 1 stage per stage number

  const currentAnnotations = state.annotations.filter(a => a.workflow_stage_id === currentStage.id)

  const copies = currentAnnotations
    .map(a => ({ ...a, workflow_stage_id: nextStage.id }))

  state.annotations = state.annotations
    .filter(a => a.workflow_stage_id !== nextStage.id)
    .concat(copies)
}

/**
 * Simulates regression of a workflow, which happens when a review stage is rejected.
 *
 * - update workflow current stage number, template id, status
 * - update associated item status
 */
export const regressItem = (item: DatasetItemPayload, state: State) => {
  const workflow = getWorkflow(item)
  const workflowTemplate = getWorkflowTemplate(state, workflow)

  const nextNumber = workflow.current_stage_number - 1
  const nextStageTemplate =
    workflowTemplate.workflow_stage_templates.find(t => t.stage_number === nextNumber)

  if (!nextStageTemplate) { return }

  workflow.current_stage_number = nextStageTemplate.stage_number
  workflow.current_workflow_stage_template_id = nextStageTemplate.id
  workflow.status = STAGE_TYPE_TO_WORKFLOW_STATUS[nextStageTemplate.type]
  item.status = STAGE_TYPE_TO_WORKFLOW_STATUS[nextStageTemplate.type]
}

/**
 * Simulates archival of a dataset item, which happens when an item is archived in review stage
 *
 * - set parent item status to archived
 * - set parent item status archived flag to true
 * - set parent item status archived reason to stage skipped reason
 */
export const archiveItem = (item: DatasetItemPayload) => {
  const workflow = getWorkflow(item)

  const { current_stage_number: stageNumber } = workflow

  const stage = workflow.stages[stageNumber][0]
  if (!stage) { throw new TutorialError('Tried to archive invalid item - current stage not found') }

  item.status = DatasetItemStatus.archived
  item.archived = true
  item.archived_reason = stage.skipped_reason
}
