import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type MigrateTeamParams = {
  feature: string
  teamId: number
}

/**
 * Starts migration of the specified team to the specified feature.
 *
 * Which migrations are supported depends on development stage
 * and will vary over time.
 */
export const migrateTeam = async (params: MigrateTeamParams) => {
  const { teamId, feature } = params
  const path = `admin/teams/${teamId}/migrate`
  const query = { feature }

  try {
    const response = await post<any>(path, query)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ADMIN_TEAM_UPDATE)
  }
}
