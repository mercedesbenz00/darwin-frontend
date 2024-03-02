import { AuthAction } from '@/store/modules/auth/types'
import { LogoutResponsePayload } from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError, session } from '@/utils'

type Logout = AuthAction<{}, LogoutResponsePayload>

export const logout: Logout = async ({ dispatch }) => {
  let response

  try {
    response = await api.logout()
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_LOGOUT)
  } finally {
    session.logout()
    await dispatch('logoutStore')
  }

  return response
}
