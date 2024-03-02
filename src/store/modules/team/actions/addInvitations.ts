import { TeamAction } from '@/store/modules/team/types'
import { InvitationPayload } from '@/store/types/InvitationPayload'
import { MembershipRole } from '@/store/types/MembershipRole'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type AddInvitationsPayload = {
  teamId: number
  invitations: Array<{
    email: string
    role: MembershipRole
  }>
}

/**
 * Add a new team invitation
 */
export const addInvitations: TeamAction<AddInvitationsPayload, InvitationPayload[]> =
  async ({ commit }, { teamId, invitations }) => {
    let response
    try {
      response = await api.post(`teams/${teamId}/invitations`, { invitations })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_MEMBERS_ADD_INVITATIONS)
    }

    commit('PUSH_INVITATIONS', response.data)
    return response
  }
