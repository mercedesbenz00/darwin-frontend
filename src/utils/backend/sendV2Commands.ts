import { ApiResponse } from '@/store/types'
import { V2WorkflowCommandPayload } from '@/store/types/V2WorkflowCommandPayload'
import { V2WorkflowCommandResponse } from '@/store/types/V2WorkflowCommandResponse'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse,
  ParsedError, parseError, ErrorResponse } from '@/utils/error'

type Params = {
  commands: Omit<V2WorkflowCommandPayload, 'id' | 'user_id'>[]
  teamSlug: string
  datasetItemId: string
}

type Response = Promise<ApiResponse<V2WorkflowCommandResponse> | ParsedError>

const parseCommandError = (errorResponse: ErrorResponse,
  commands: Omit<V2WorkflowCommandPayload, 'id' | 'user_id'>[]): ParsedError => {
  if (commands.length) {
    const command = commands[0]
    if (command.type === 'create_annotation') {
      return parseError(errorResponse, errorMessages.ANNOTATION_CREATE)
    }
    if (command.type === 'update_annotation') {
      return parseError(errorResponse, errorMessages.ANNOTATION_UPDATE)
    }
    if (command.type === 'delete_annotation') {
      return parseError(errorResponse, errorMessages.ANNOTATION_DELETE)
    }
  }
  return parseError(errorResponse, errorMessages.WORKFLOW_CREATE)
}

/**
 * Sends a batch of commands to a v2 workflow item.
 *
 * All commands must be valid in order for any of them to execute.
 * If valid, they enqueue in the given order.
 *
 * Note that if any of the commnads is given a delay, then it might execute out
 * of order with the other commands.
 */
export const sendV2Commands = async (params: Params): Response => {
  const { teamSlug, datasetItemId } = params
  const path = `v2/teams/${teamSlug}/items/${datasetItemId}/commands`

  try {
    const response = await post<V2WorkflowCommandResponse>(path, { commands: params.commands })
    return { data: response.data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseCommandError(error, params.commands)
  }
}
