import { RegisterTeamParams, TeamAction } from '@/store/modules/team/types'
import { TeamPayload } from '@/store/types/TeamPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

/**
 * Register new team
 * @param name Team Name
 * @param hash Team Logo Hash
 * @param members Team Members list
 * @param content Team Logo Content
 * @param type Team Logo Image Type
 */
export const register: TeamAction<RegisterTeamParams, TeamPayload> =
  async ({ commit, dispatch }, params) => {
    const { name, hash } = params
    let response
    try {
      response = await api.post('teams', { name, hash })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_REGISTER)
    }

    try {
      await dispatch('resolveImageUrl', { data: response.data, params })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_REGISTER)
    }

    commit('SET_CURRENT_TEAM', response.data)
    commit('PUSH_TEAM', response.data)

    return response
  }
