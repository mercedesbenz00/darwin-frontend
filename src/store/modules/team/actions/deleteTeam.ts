import { TeamAction } from '@/store/modules/team/types'
import { TeamPayload } from '@/store/types/TeamPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

/**
 * Soft-delete a team on the backend
 */
export const deleteTeam: TeamAction<TeamPayload, { success: boolean }> = async (_, team) => {
  try {
    return await api.put(`teams/${team.id}/archive`)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.TEAM_DELETE)
  }
}
