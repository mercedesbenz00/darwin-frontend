import { TeamAction } from '@/store/modules/team/types'
import { InvitationPayload } from '@/store/types/InvitationPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type DeleteMembershipPayload = {
  id: number
}

/**
 * Delete a membership
 */
export const deleteMembership: TeamAction<DeleteMembershipPayload, InvitationPayload> =
  async ({ commit }, params) => {
    let response
    try {
      response = await api.remove(`memberships/${params.id}`)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_MEMBERS_DELETE_MEMBERSHIP, params)
    }
    commit('DELETE_MEMBERSHIP', params.id)
    return response
  }
