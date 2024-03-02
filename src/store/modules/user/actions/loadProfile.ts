import { UserAction } from '@/store/modules/user/types'
import { UserPayload } from '@/store/types/UserPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

type LoadProfile = UserAction<{}, UserPayload>

export const loadProfile: LoadProfile = async ({ commit }) => {
  let response

  try {
    response = await api.get('users/profile')
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.PROFILE_LOAD)
  }

  commit('SET_PROFILE', response.data)
  return response
}
