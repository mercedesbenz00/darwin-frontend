import { TeamAction } from '@/store/modules/team/types'
import { InvitationPayload } from '@/store/types/InvitationPayload'
import { TeamPayload } from '@/store/types/TeamPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

/**
 * Load current team invitations
 */
export const getInvitations: TeamAction<TeamPayload, InvitationPayload[]> =
  async ({ commit, state }) => {
    if (!state.currentTeam) { throw new Error('team/getInvitations: No team selected') }

    let response
    try {
      response = await api.get('invitations', {
        team_id: state.currentTeam.id,
        confirmed: false
      })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_MEMBERS_LOAD_INVITATIONS)
    }

    commit('SET_INVITATIONS', response.data)
    return response
  }
