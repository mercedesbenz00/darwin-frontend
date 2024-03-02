import { AuthAction } from '@/store/modules/auth/types'
import { LoginResponsePayload } from '@/store/types'
import { session } from '@/utils'
import { login2fa as request } from '@/utils/backend'

export type Login2FAActionParams = {
  email: string
  password: string
  token: string
}

type Login2fa = AuthAction<Login2FAActionParams, LoginResponsePayload>

/**
 * Request 2fa secret key to the backend
 */
export const login2fa: Login2fa = async ({ commit, dispatch }, params) => {
  const response = await request(params)
  if ('error' in response) {
    return response
  }

  const { data } = response
  commit('SET_AUTHENTICATED', true)
  commit('SET_ABILITIES', data.selected_team_abilities)
  commit('user/SET_PROFILE', data, { root: true })
  commit('team/SET_CURRENT_TEAM', data.selected_team, { root: true })
  commit('team/SET_TEAMS', data.teams, { root: true })

  session.authenticate({
    isPermanent: true,
    refreshToken: data.refresh_token,
    token: data.token,
    tokenExpiration: data.token_expiration
  })

  // Some features are based on team, so they need to be re-fetched upon login
  await dispatch('features/getFeatures', {}, { root: true })

  return response
}
