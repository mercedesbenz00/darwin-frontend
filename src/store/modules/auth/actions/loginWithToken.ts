import { AuthAction } from '@/store/modules/auth/types'
import { LoginResponsePayload } from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError, session } from '@/utils'

type LoginWithToken = AuthAction<void, LoginResponsePayload>

export const loginWithToken: LoginWithToken = async ({ commit, dispatch }) => {
  let response

  try {
    response = await api.get('users/token_info')
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_LOGIN_WITH_TOKEN)
  }

  const { data } = response
  const meta = {
    // analytics: [['set', 'userId', data.id]]
  }
  commit('SET_AUTHENTICATED', { meta })
  commit('SET_ABILITIES', data.selected_team_abilities)
  commit('user/SET_PROFILE', data, { root: true })
  commit('team/SET_CURRENT_TEAM', data.selected_team, { root: true })
  commit('team/SET_TEAMS', data.teams, { root: true })

  session.updateToken({
    token: data.token,
    tokenExpiration: data.token_expiration
  })

  await dispatch('features/getFeatures', {}, { root: true })

  return response
}
