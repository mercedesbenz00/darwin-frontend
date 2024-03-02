import { SSOAction, SSOPayload } from '@/store/modules/sso/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export const saveConfig: SSOAction<string, SSOPayload> = async (
  { commit, rootState, state },
  config: string
) => {
  const { currentTeam } = rootState.team
  if (!currentTeam) { throw new Error('[sso/loadConfig]: Current team not set') }

  let response
  // API waits for POST request if config is not set and for PUT if it is
  if (state.config) {
    try {
      response = await api.put(`/teams/${currentTeam.id}/sso/saml`, {
        idp_metadata: config
      })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      const reason = error.response?.data?.errors?.detail

      return parseError(error, typeof reason === 'string'
        ? { default: reason }
        : errorMessages.SAVE_SSO_CONFIG
      )
    }
  } else {
    try {
      response = await api.post(`/teams/${currentTeam.id}/sso/saml`, {
        idp_metadata: config
      })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      const reason = error.response?.data?.errors?.detail
      return parseError(error, typeof reason === 'string'
        ? { default: reason }
        : errorMessages.SAVE_SSO_CONFIG
      )
    }
  }

  if ('data' in response) {
    commit('SET_CONFIG', response.data?.idp_metadata)
  }

  return response
}
