import { TeamAction } from '@/store/modules/team/types'
import { InvitationPayload } from '@/store/types/InvitationPayload'
import { MembershipRole } from '@/store/types/MembershipRole'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type UpdateMembershipPayload = {
  id: number
  role: MembershipRole
}

/**
 * Update a team membership
 */
export const updateMembership: TeamAction<UpdateMembershipPayload, InvitationPayload> =
  async ({ commit }, params) => {
    let response

    try {
      response = await api.put(`memberships/${params.id}`, { role: params.role })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_MEMBERS_UPDATE_MEMBERSHIP, params)
    }

    commit('UPDATE_MEMBERSHIP', response.data)

    return response
  }
