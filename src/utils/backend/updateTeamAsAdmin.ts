import { put } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

type Params = {
  /* eslint-disable camelcase */
  name?: string
  slug?: string
  note?: string
  disabled?: boolean
  neural_models_enabled?: boolean
  // the admin can only toggle partner/regular status, not set someone to be a
  // client, so this structure should reflect that
  managed_status?: 'partner' | 'regular'
  /* eslint-enable camelcase */
  teamId: number
}

export const updateTeamAsAdmin = async (params: Params) => {
  const { teamId, ...requestParams } = params
  const path = `admin/teams/${teamId}`

  try {
    const response = await put(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ADMIN_TEAM_UPDATE)
  }
}
