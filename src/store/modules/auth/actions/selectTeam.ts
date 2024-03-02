import { AuthAction } from '@/store/modules/auth/types'
import { LoginResponsePayload } from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError, session } from '@/utils'

export type SelectTeamActionParams = {
  // eslint-disable-next-line camelcase
  team_id: string
}

type SelectTeam = AuthAction<SelectTeamActionParams, LoginResponsePayload>

export const selectTeam: SelectTeam = async ({ commit, dispatch }, params) => {
  let response

  try {
    response = await api.selectTeam(params)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_SELECT_TEAM)
  }

  // We reset picked module's state to initial state while changing the team
  // The user, auth, toast and feedback stores are not team-dependent,
  // so we do not need to reset those
  commit('aclass/RESET_ALL', null, { root: true })
  commit('annotator/RESET_ALL', null, { root: true })
  commit('billing/RESET_ALL', null, { root: true })
  commit('comment/RESET_ALL', null, { root: true })
  commit('dataset/RESET_ALL', null, { root: true })
  commit('datasetUpload/RESET_ALL', null, { root: true })
  commit('neuralModel/RESET_ALL', null, { root: true })
  commit('workview/RESET_ALL', null, { root: true })
  commit('workviewTracker/RESET_ALL', null, { root: true })
  commit('storage/RESET_ALL', null, { root: true })
  commit('ui/SET_WORKER_MODE', false, { root: true })

  const { data } = response
  commit('SET_ABILITIES', data.selected_team_abilities)
  commit('team/SET_CURRENT_TEAM', data.selected_team, { root: true })
  commit('team/SET_TEAMS', data.teams, { root: true })

  session.authenticate({
    refreshToken: data.refresh_token,
    token: data.token,
    tokenExpiration: data.token_expiration
  })

  // Some features are based on team, so they need to be re-fetched upon login
  await dispatch('features/getFeatures', {}, { root: true })

  return response
}
