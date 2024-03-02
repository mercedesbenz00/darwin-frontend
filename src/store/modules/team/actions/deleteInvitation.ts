import { TeamAction } from '@/store/modules/team/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type DeleteInvitationPayload = {
  id: number
}

/**
 * Delete a team invitation
 * @param id Invitation Id
 */
export const deleteInvitation: TeamAction<DeleteInvitationPayload, { success: boolean }> =
  async ({ commit }, params) => {
    let response
    try {
      response = await api.remove(`invitations/${params.id}`)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_MEMBERS_DELETE_INVITATION, params)
    }

    commit('DELETE_INVITATION', params.id)
    return response
  }
