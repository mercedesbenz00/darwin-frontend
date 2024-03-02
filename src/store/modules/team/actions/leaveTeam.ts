import { TeamAction } from '@/store/modules/team/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type LeaveTeamPayload = {
  membershipId: number
}

/**
 * Soft-delete a team on the backend
 */
export const leaveTeam: TeamAction<LeaveTeamPayload, { success: boolean }> = async (_, params) => {
  try {
    return await api.remove(`memberships/${params.membershipId}`)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.TEAM_LEAVE)
  }
}
