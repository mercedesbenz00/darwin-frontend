import { AxiosResponse } from 'axios'

import { TeamUploadInfoPayload } from '@/store/types'
import { post } from '@/utils/api'
import { isErrorResponse, parseError } from '@/utils/error'

type Params = {
  id?: string
  teamSlug: string
  type: 'annotation_class' | 'annotation_class_crop'
}

/**
 * Simply creates a feature flag for the specified team
 */
export const createUploadInfo = async (params: Params) => {
  const path = `teams/${params.teamSlug}/upload_info`

  let response: AxiosResponse<TeamUploadInfoPayload>

  const backendParams = {
    type: params.type,
    ...(params.id && { id: params.id })
  }
  try {
    response = await post<TeamUploadInfoPayload>(path, backendParams)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error)
  }
  return response
}
