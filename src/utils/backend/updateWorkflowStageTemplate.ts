import { ApiResponse, WorkflowStageTemplatePayload } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
/* eslint-disable camelcase */
  id: number
  metadata: WorkflowStageTemplatePayload['metadata']
  workflow_stage_template_assignees: {
    assignee_id: number
    sampling_rate: number
  }[]
  /* eslint-enable camelcase */
}

/**
 * Update an existing workflow stage template
 */
export const updateWorkflowStageTemplate = async (
  params: Params
): Promise<ApiResponse<WorkflowStageTemplatePayload> | ParsedError> => {
  const path = `workflow_stage_templates/${params.id}`

  try {
    return await put<WorkflowStageTemplatePayload>(path, params)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOW_UPDATE)
  }
}
