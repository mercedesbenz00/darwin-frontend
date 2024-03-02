import { BillingInfoPayload } from '@/store/modules/billing/types'
import {
  AttributePayload,
  DatasetItemPayload,
  ReviewStatus,
  SkippedReason,
  StageAnnotationPayload,
  StageType,
  WorkflowActionPayload,
  WorkflowStagePayload,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload
} from '@/store/types'
import { post, get, remove, put } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

// dataset items

export type LoadDatasetItemParams = { datasetId: number, id: number }

/**
 * Retrieves single dataset item from the backend
 */
export const loadDatasetItem = async (params: LoadDatasetItemParams) => {
  const path = `datasets/${params.datasetId}/items/${params.id}`

  try {
    const response = await get<DatasetItemPayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}

/**
 * Load a single workflow template by id.
 */
export type LoadWorkflowTemplateParams = { id: number }

export const loadWorkflowTemplate = async (params: LoadWorkflowTemplateParams) => {
  const path = `workflow_templates/${params.id}`

  try {
    const response = await get<WorkflowTemplatePayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}

/**
 * Load workflow templates for a dataset
 */
export type LoadWorkflowTemplatesParams = { datasetId: number }

export const loadWorkflowTemplates = async (params: LoadWorkflowTemplatesParams) => {
  const path = `datasets/${params.datasetId}/workflow_templates`

  try {
    const response = await get<WorkflowTemplatePayload[]>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOW_TEMPLATES_LOAD)
  }
}

type CreateWorkflowTemplateParams = {
  /* eslint-disable camelcase */
  dataset_id: number
  workflow_stage_templates: {
    metadata: WorkflowStageTemplatePayload['metadata'],
    stage_number: number
    type: StageType
    workflow_stage_template_assignees: {
      assignee_id: number
      sampling_rate: number
    }[]
  }[]
  /* eslint-enable camelcase */
}

/**
 * Create a new workflow template
 */
export const createWorkflowTemplate = async (params: CreateWorkflowTemplateParams) => {
  const path = `datasets/${params.dataset_id}/workflow_templates`

  try {
    const response = await post<WorkflowTemplatePayload>(path, params)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOW_TEMPLATE_CREATE)
  }
}

/**
 * Set a workflow template as a default one
 */
export type SetDefaultWorkflowTemplateParams = { datasetId: number, workflowTemplateId: number }

export const setDefaultWorkflowTemplate = async (params: SetDefaultWorkflowTemplateParams) => {
  const path = `datasets/${params.datasetId}/default_workflow_template/${params.workflowTemplateId}`

  try {
    const response = await put<WorkflowTemplatePayload>(path, {})
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOW_TEMPLATE_SET_DEFAULT)
  }
}

/**
 * Defines params structure for the loadStageAnnotations backend action
 */
export type LoadStageAnnotationsParams = { stageId: number }

/**
 * Loads stage annotations for the specified stage id
 */
export const loadStageAnnotations = async (params: LoadStageAnnotationsParams) => {
  const path = `workflow_stages/${params.stageId}/annotations`

  try {
    const response = await get<StageAnnotationPayload[]>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.STAGE_LOAD)
  }
}

/**
 * Defines params structure for the createStageAnnotation backend action
 */
export type CreateStageAnnotationParams = {
  id?: string
  annotationClassId: number
  data: object
  stageId: number
  zIndex?: number
}

/**
 * Creates a new stage annotation on the backend
 */
export const createStageAnnotation = async (params: CreateStageAnnotationParams) => {
  const path = `workflow_stages/${params.stageId}/annotations`
  const attrs = {
    id: params.id,
    data: params.data,
    z_index: params.zIndex,
    annotation_class_id: params.annotationClassId
  }

  try {
    const response = await post<StageAnnotationPayload>(path, attrs)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_ANNOTATE)
  }
}

/**
 * Defines params structure for the deleteStageAnnotation backend action
 */
export type DeleteStageAnnotationParams = { id: string, stageId: number }

/**
 * Deletes an existing stage annotation on the backend
 */
export const deleteStageAnnotation = async (params: DeleteStageAnnotationParams) => {
  const path = `workflow_stages/${params.stageId}/annotations/${params.id}`

  try {
    const response = await remove<StageAnnotationPayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_ANNOTATE)
  }
}

/**
 * Defines params structure for the deleteStageAnnotations backend action
 */
export type DeleteStageAnnotationsParams = { ids: string[], stageId: number }

/**
 * Deletes an existing stage annotations on the backend
 */
export const deleteStageAnnotations = async (params: DeleteStageAnnotationsParams) => {
  const path = `workflow_stages/${params.stageId}/delete_annotations`

  try {
    const response = await post<StageAnnotationPayload[]>(path, { ids: params.ids })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_ANNOTATE)
  }
}

export type CopyStageAnnotationsParams = { fromStageId: number, toStageId: number }

/**
 * Copies stage annotations from one stage to another
 */
export const copyStageAnnotations = async (params: CopyStageAnnotationsParams) => {
  const path = `workflow_stages/${params.fromStageId}/copy/${params.toStageId}`
  try {
    const response = await put<StageAnnotationPayload[]>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_ANNOTATE)
  }
}

type RequestWorkParams = { datasetId: number }

// work assignment

/**
 * Requests auto-assignment of items for an annotator from the backend
 */
export const requestWork = async ({ datasetId }: RequestWorkParams) => {
  try {
    const response = await post(`/datasets/${datasetId}/request_work`)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.STAGE_REQUEST)
  }
}

type RequestWorkBatchParams = { teamSlug: string, workflowId: string }

/**
 * Requests auto-assignment of items in a workflow for an annotator
 */
export const requestWorkBatchInWorkflow =
  async ({ teamSlug, workflowId }: RequestWorkBatchParams) => {
    try {
      return await post(`/v2/teams/${teamSlug}/items/request_work_batch`, {
        workflow_id: workflowId
      })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.STAGE_REQUEST)
    }
  }

/**
 * Defines param structure for the assignStage backend action
 */
export type AssignStageParams = { stageId: number, userId: number }

/**
 * Requests assignment of stage to specified user
 */
export const assignStage = async (params: AssignStageParams) => {
  const path = `workflow_stages/${params.stageId}/assign`
  try {
    const response = await post<WorkflowStagePayload>(path, { user_id: params.userId })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error)
  }
}

/**
 * Defines param structure for the setStageAutoComplete backend action
 */
export type SetStageAutoCompleteParams = { stageId: number }

/**
 * Requests auto-completetion of stage and progressing of workflow after a set time period
 */
export const setStageAutoComplete = async (params: SetStageAutoCompleteParams) => {
  const path = `workflow_stages/${params.stageId}/auto_complete`
  try {
    const response = await post(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error)
  }
}

/**
 * Defines param structure for the cancelStageAutoComplete backend action
 */
export type CancelStageAutoCompleteParams = { stageId: number }

/**
 * Requests cancelling of stage auto-completetion
 */
export const cancelStageAutoComplete = async (params: SetStageAutoCompleteParams) => {
  const path = `workflow_stages/${params.stageId}/auto_complete`
  try {
    const response = await remove(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error)
  }
}

/**
 * Defines param structure for the setStageReviewStatus backend action
 */
export type SetStageReviewStatusParams = { stageId: number, status: ReviewStatus | null }

/**
 * Sets review status on backend
 */
export const setStageReviewStatus = async (params: SetStageReviewStatusParams) => {
  const path = `workflow_stages/${params.stageId}/review`

  const attrs = {
    status: params.status
  }

  try {
    const response = await put(path, attrs)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error)
  }
}

/**
 * Defines param structure for the skipStage backend action
 */
export type SkipStageParams = { stageId: number, reason: SkippedReason }

/**
 * Marks stage on backend as skipped, with specified skip reason
 */
export const skipStage = async (params: SkipStageParams) => {
  const path = `workflow_stages/${params.stageId}/skip`

  const attrs = { reason: params.reason }

  try {
    const response = await post(path, attrs)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error)
  }
}

/**
 * Defines param structure for the unskipStage backend action
 */
export type UnskipStageParams = { stageId: number }

/**
 * Unskips previously skipped stage on backend
 */
export const unskipStage = async (params: UnskipStageParams) => {
  const path = `workflow_stages/${params.stageId}/unskip`

  try {
    const response = await post<WorkflowStagePayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error)
  }
}

export type CreateOrFetchAnnotationAttributeParams = {
  classId: number
  color: string
  name: string
}

export const createOrFetchAnnotationAttribute =
  async (params: CreateOrFetchAnnotationAttributeParams) => {
    const { classId, name, color } = params
    const path = `annotation_classes/${classId}/attributes`
    const attrs = { name, color }
    try {
      const response = await post<AttributePayload>(path, attrs)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ATTRIBUTE_CREATE)
    }
  }

export type LoadClassAnnotationAttributesParams = { classId: number }

export const loadClassAnnotationAttributes =
  async (params: LoadClassAnnotationAttributesParams) => {
    const path = `annotation_classes/${params.classId}/attributes`
    try {
      const response = await get<AttributePayload[]>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error)
    }
  }

export type LoadDatasetAnnotationAttributesParams = { teamSlug: string }

export const loadDatasetAnnotationAttributes =
  async (params: LoadDatasetAnnotationAttributesParams) => {
    const path = `teams/${params.teamSlug}/attributes`
    try {
      const response = await get<AttributePayload[]>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error)
    }
  }

export type UpdateBillingInfoParams = {
  /* eslint-disable camelcase */
  address?: {
    city: string | null
    country: string | null
    line_1: string | null
    line_2: string | null
    postal_code: string | null
    state: string | null
  }
  name?: string | null
  email?: string | null
  tax_id?: string | null
  teamId: number
  token?: string
  /* eslint-enable camelcase */
}

/**
 * Updates customer billing info on backend.
 *
 * This can involve
 *
 * - payment method token, resulting in a card being attached to the customer on stripe
 * - address fields, resulting in those fields being set on the stripe customer record
 * - taxId, resulting in the current stripe customer tax id being replaced by the new one
 * - email, resulting in email being set on stripe customer
 *
 * Note all of this information is saved on stripe,
 * with the backend just serving as an adapter/proxy,
 * so the request may be slower than some other requests.
 */
export const updateBillingInfo = async (params: UpdateBillingInfoParams) => {
  const path = `customers/${params.teamId}`

  const { address, token, tax_id: taxId, email, name } = params
  const query = {
    ...(address !== undefined && { ...address }),
    ...(email !== undefined && { email }),
    ...(name !== undefined && { name }),
    ...(taxId !== undefined && { tax_id: taxId }),
    ...(token !== undefined && { token })
  }

  try {
    const response = await put<BillingInfoPayload>(path, query)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.BILLING_INFO_UPDATE)
  }
}

export type UpdateSubscriptionParams = {
  /* eslint-disable camelcase */
  annotation_credits_standard?: number
  storage_standard?: number
  /* eslint-enable camelcase */
  /* Id of the team associated to the customer. Determines request path */
  teamId: number
}

/**
 * Updates customer subscription info.
 *
 * This allows changing amounts and auto-increase behavior
 * for each product category in the customer's subscription.
 */
export const updateSubscription = async (params: UpdateSubscriptionParams) => {
  const { teamId, ...query } = params
  const path = `customers/${teamId}/subscription`

  try {
    const response = await put<BillingInfoPayload>(path, query)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.BILLING_INFO_UPDATE)
  }
}

export type LoadWorkflowActionsParams = {
  datasetItemId: number
}

/**
 * Sends request to retrieve all workflow actions across all workflows, for
 * a dataset item.
 */
export const loadWorkflowActions = async (params: LoadWorkflowActionsParams) => {
  const { datasetItemId } = params
  const path = `dataset_items/${datasetItemId}/workflow_actions`
  try {
    const response = await get<WorkflowActionPayload[]>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEM_LOAD)
  }
}

export enum WindAuthAction {
  DeployModel = 'deploy_model',
  RunInference = 'run_inference',
  TrainModels = 'train_models',
  ViewModels = 'view_models'
}
export type CreateWindAuthParams = {
  action: WindAuthAction
  teamId: number
}

export const createWindAuth = async (params: CreateWindAuthParams) => {
  const { action, teamId } = params
  const path = `teams/${teamId}/wind_auth`
  const payload = { action }
  try {
    const response = await post<{ token: string }>(path, payload)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WIND_AUTH_CREATE)
  }
}

export type DeleteExportParams = {
  datasetId: number,
  name: string
}

export const deleteExport = async (params: DeleteExportParams) => {
  const { datasetId, name } = params
  const path = `datasets/${datasetId}/exports/${name}`
  try {
    const response = await remove(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_EXPORT)
  }
}

export { addPriorityToItems } from './addPriorityToItems'
export { archiveItems } from './archiveItems'

export { assignItems } from './assignItems'
export { confirm2fa } from './confirm2fa'
export * from './createAnnotationClass'
export { createApiKey } from './createApiKey'
export { createClientTeamInvitation } from './createClientTeamInvitation'
export { createRegularTeamInvitation } from './createRegularTeamInvitation'
export { createTeamFeature } from './createTeamFeature'
export { createUploadInfo } from './createUploadInfo'
export { createWorkflow } from './createWorkflow'
export { deleteItems } from './deleteItems'
export { downloadDatasetItemReport } from './downloadDatasetItemReport'
export { exportDataset } from './exportDataset'

export { loadAnnotationClasses } from './loadAnnotationClasses'
export { loadAnnotationTypes } from './loadAnnotationTypes'
export { loadBillingInfo } from './loadBillingInfo'
export { loadClassUsage } from './loadClassUsage'
export { loadCountries } from './loadCountries'
export { loadCreditUsage } from './loadCreditUsage'
export { loadDataset } from './loadDataset'
export { loadDatasetFolders } from './loadDatasetFolders'
export { loadDatasetItems } from './loadDatasetItems'
export { loadDatasetStatusCounts } from './loadDatasetStatusCounts'
export { loadDatasetClassCounts } from './loadDatasetClassCounts'

export { loadDatasetGeneralCounts } from './loadDatasetGeneralCounts'
export { loadDatasetItemTimeSummary } from './loadDatasetItemTimeSummary'
export { loadV2DatasetItemTimeSummary } from './loadV2DatasetItemTimeSummary'
export { loadDatasetReport } from './loadDatasetReport'
export { loadInvoices } from './loadInvoices'
export { loadTeamMemberships } from './loadTeamMemberships'
export { loadWorkforceManagers } from './loadWorkforceManagers'
export { login } from './login'
export { login2fa } from './login2fa'
export { loginSSO } from './loginSSO'
export { migrateTeam } from './migrateTeam'
export { moveDatasetItemsToNew } from './moveDatasetItemsToNew'
export { moveItemsToPath } from './moveItemsToPath'
export { resetDatasetItems } from './resetDatasetItems'
export { restoreItems } from './restoreItems'
export { setDatasetItemsStage } from './setDatasetItemsStage'
export { setup2fa } from './setup2fa'
export { tagDatasetItems } from './tagDatasetItems'
export { untagDatasetItems } from './untagDatasetItems'
export * from './updateAnnotationClass'
export * from './updateStageAnnotation'
export { updateApiKey } from './updateApiKey'
export { updateCard } from './updateCard'
export { updateCustomerSubscription } from './updateCustomerSubscription'
export { updateWorkflowStageTemplate } from './updateWorkflowStageTemplate'
export { updateTeamAsAdmin } from './updateTeamAsAdmin'
export { updateTeamUsageLimit } from './updateTeamUsageLimit'

export * from './updateDataset'
export { getStorages } from './getStorages'
export { createStorage } from './createStorage'
export { deleteStorage } from './deleteStorage'
export { updateStorage } from './updateStorage'
export { setStorageAsDefault } from './setStorageAsDefault'

// dataset item reports
export { createDatasetItemReport } from './createDatasetItemReport'
export { deleteDatasetItemReport } from './deleteDatasetItemReport'
export { loadDatasetItemReport } from './loadDatasetItemReport'
export { loadDatasetItemReports } from './loadDatasetItemReports'

/**
 * Force sync API keys with Wind
 */
export const syncApiKeys = async () => {
  const path = 'admin/sync_api_keys'

  try {
    const response = await post<{ result: 'ok' }>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.API_KEY_SYNC)
  }
}

// v1 comments
export { createComment } from './createComment'
export { createCommentThread } from './createCommentThread'
export { deleteComment } from './deleteComment'
export { deleteCommentThread } from './deleteCommentThread'
export { loadComments } from './loadComments'
export { loadCommentThreads } from './loadCommentThreads'
export { updateComment } from './updateComment'
export { updateCommentThread } from './updateCommentThread'

// v2 items
export { archiveV2Items } from './archiveV2Items'
export { loadFile } from './loadFile'
export { loadV2DatasetIds } from './loadV2DatasetIds'
export { addPriorityToV2Items } from './addPriorityToV2Items'

export { deleteV2Annotations } from './deleteV2Annotations'
export { deleteV2Export } from './deleteV2Export'
export { deleteV2Items } from './deleteV2Items'
export { exportV2Dataset } from './exportV2Dataset'
export { loadV2Annotations } from './loadV2Annotations'
export { loadV2AnnotationsSnapshot } from './loadV2AnnotationsSnapshot'
export { loadV2DatasetClassCounts } from './loadV2DatasetClassCounts'
export { loadV2DatasetFolders } from './loadV2DatasetFolders'
export { loadV2DatasetGeneralCounts } from './loadV2DatasetGeneralCounts'
export { loadV2DatasetItem } from './loadV2DatasetItem'
export { loadV2DatasetItems } from './loadV2DatasetItems'
export { loadV2DatasetStatusCounts } from './loadV2DatasetStatusCounts'
export { loadV2ItemsStageCounts } from './loadV2ItemsStageCounts'
export { moveV2ItemsToPath } from './moveV2ItemsToPath'
export { restoreV2Items } from './restoreV2Items'
export { setV2FilesToUpload } from './setV2FilesToUpload'
export { tagDatasetItemsV2 } from './tagDatasetItemsV2'
export { untagDatasetItemsV2 } from './untagDatasetItemsV2'

// v2 workflows
export { assignV2Items } from './assignV2Items'
export { loadV2Workflow } from './loadV2Workflow'
export { loadV2Workflows } from './loadV2Workflows'
export { sendV2Commands } from './sendV2Commands'
export { setV2Stage } from './setV2Stage'
export { copyV2StageAnnotations } from './copyV2StageAnnotations'

// v2 comments
export { createV2Comment } from './createV2Comment'
export { createV2CommentThread } from './createV2CommentThread'
export { deleteV2Comment } from './deleteV2Comment'
export { deleteV2CommentThread } from './deleteV2CommentThread'
export { loadV2Comments } from './loadV2Comments'
export { loadV2CommentThreads } from './loadV2CommentThreads'
export { updateV2Comment } from './updateV2Comment'
export { updateV2CommentThread } from './updateV2CommentThread'
