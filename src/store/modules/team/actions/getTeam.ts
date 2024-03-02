import { TeamAction } from '@/store/modules/team/types'
import { TeamPayload } from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

/**
 * Get Detailed team information
 * @param teamId Team Id
 */
export const getTeam: TeamAction<number, TeamPayload> =
  async ({ commit, state }, teamId) => {
    let response

    try {
      response = await api.get(`teams/${teamId}`)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_LOAD)
    }
    const team = response.data as TeamPayload
    const { currentTeam } = state

    if (currentTeam && currentTeam.id === team.id) {
      commit('SET_CURRENT_TEAM', team)
    }
    commit('PUSH_TEAM', response.data)
    return response
  }
