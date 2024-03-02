import { TeamAction } from '@/store/modules/team/types'
import { TeamPayload } from '@/store/types/TeamPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type UpdateTeamPayload = {
  /* eslint-disable camelcase */
  id: number
  disable_dataset_sharing: boolean
  two_factor_auth_enforced: boolean
  sso_enforced: boolean
  default_role?: string
  email_domain?: string

  content?: Blob
  hash?: string
  name?: string
  type?: string
  /* eslint-enable camelcase */
}

/**
 * Update team information
 */
export const updateTeam: TeamAction<UpdateTeamPayload, TeamPayload> =
  async ({ commit, dispatch }, params) => {
    const updateParams = {
      ...params,
      id: undefined,
      content: undefined,
      type: undefined
    }

    let response

    try {
      response = await api.put(`teams/${params.id}`, updateParams)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_UPDATE)
    }

    const { data } = response
    try {
      await dispatch('resolveImageUrl', { data, params })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_REGISTER)
    }
    commit('SET_CURRENT_TEAM', data)
    commit('PUSH_TEAM', data)

    return { data }
  }
