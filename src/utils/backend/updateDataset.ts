import { DatasetPayload } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

export type UpdateDatasetParams = {
  annotationHotkeys?: { [key: string]: string }
  annotators?: { userId: number }[]
  annotatorsCanCreateTags?: boolean
  annotatorsCanInstantiateWorkflows?: boolean
  anyoneCanDoubleAssign?: boolean
  datasetId: number
  instructions?: string
  name?: string
  pdfFitPage?: boolean
  public?: boolean
  reviewersCanAnnotate?: boolean
  workforceManagers?: { managerId?: number, invitationId?: number, userId?: number}[]
  workPrioritization?: string
  workSize?: number
}

/* eslint-disable camelcase */
type BackendParams = {
  annotation_hotkeys?: { [key: string]: string }
  annotators?: { user_id: number }[]
  annotators_can_create_tags?: boolean
  annotators_can_instantiate_workflows?: boolean
  anyone_can_double_assign?: boolean
  instructions?: string
  name?: string
  pdf_fit_page?: boolean
  public?: boolean
  reviewers_can_annnotate?: boolean
  workforce_managers?: { id?: number, invitation_id?: number, user_id?: number }[]
  work_prioritization?: string
  work_size?: number
}
/* eslint-enable camelcase */

/**
 * Retrieves list of dataset items from the backend
 *
 * Supports pagination, filtering and ordering.
 */
export const updateDataset = async (params: UpdateDatasetParams) => {
  const {
    annotationHotkeys,
    annotators,
    annotatorsCanCreateTags,
    annotatorsCanInstantiateWorkflows,
    anyoneCanDoubleAssign,
    datasetId,
    instructions,
    name,
    pdfFitPage,
    public: isPublic,
    reviewersCanAnnotate,
    workforceManagers,
    workPrioritization,
    workSize
  } = params

  const path = `datasets/${datasetId}`
  const requestParams: BackendParams = {}

  if (annotators) { requestParams.annotators = annotators.map(a => ({ user_id: a.userId })) }

  if (annotationHotkeys !== undefined) {
    requestParams.annotation_hotkeys = annotationHotkeys
  }

  if (annotatorsCanCreateTags !== undefined) {
    requestParams.annotators_can_create_tags = annotatorsCanCreateTags
  }

  if (annotatorsCanInstantiateWorkflows !== undefined) {
    requestParams.annotators_can_instantiate_workflows = annotatorsCanInstantiateWorkflows
  }

  if (anyoneCanDoubleAssign !== undefined) {
    requestParams.anyone_can_double_assign = anyoneCanDoubleAssign
  }

  if (instructions) { requestParams.instructions = instructions }
  if (name) { requestParams.name = name }

  if (pdfFitPage !== undefined) { requestParams.pdf_fit_page = pdfFitPage }

  if (isPublic !== undefined) { requestParams.public = isPublic }

  if (reviewersCanAnnotate !== undefined) {
    requestParams.reviewers_can_annnotate = reviewersCanAnnotate
  }

  if (workforceManagers) {
    requestParams.workforce_managers = workforceManagers.map(m => {
      return {
        ...(m.managerId && { manager_id: m.managerId }),
        ...(m.userId && { user_id: m.userId }),
        ...(m.invitationId && { invitation_id: m.invitationId })
      }
    })
  }

  if (workPrioritization) { requestParams.work_prioritization = workPrioritization }
  if (workSize) { requestParams.work_size = workSize }

  try {
    const response = await put<DatasetPayload>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_UPDATE)
  }
}
