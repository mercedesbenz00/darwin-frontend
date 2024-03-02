import { UserAction } from '@/store/modules/user/types'
import { UserPayload } from '@/store/types/UserPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

type ConfirmTutorial = UserAction<{}, UserPayload>

/**
 * Confirm Tutorial has been either accessed or hidden
 */
export const confirmTutorial: ConfirmTutorial = async ({ commit }) => {
  let response

  try {
    response = await api.post('users/confirm_tutorial', {})
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.PROFILE_UPDATE)
  }

  commit('SET_TUTORIAL_SEEN')
  return response
}
