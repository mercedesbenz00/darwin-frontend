import { TeamAction } from '@/store/modules/team/types'
import { InvitationPayload } from '@/store/types/InvitationPayload'
import { MembershipRole } from '@/store/types/MembershipRole'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type UpdateInvitationPayload = {
  id: number
  role: MembershipRole
}

/**
 * Update team invitation
 */
export const updateInvitation: TeamAction<UpdateInvitationPayload, InvitationPayload> =
  async ({ commit }, params) => {
    let response
    try {
      response = await api.put(`invitations/${params.id}`, { role: params.role })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_MEMBERS_UPDATE_INVITATION, params)
    }

    commit('UPDATE_INVITATION', response.data)
    return response
  }
