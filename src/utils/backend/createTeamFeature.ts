import { FeaturePayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  feature: FeaturePayload['name']
  teamId: number
}

/**
 * Simply creates a feature flag for the specified team
 */
export const createTeamFeature = async (params: Params) => {
  const path = `teams/${params.teamId}/features/${params.feature}`

  let response

  try {
    response = await post(path)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ADMIN_TEAM_UPDATE)
  }
  return response
}
