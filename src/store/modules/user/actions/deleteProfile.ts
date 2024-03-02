import { UserAction } from '@/store/modules/user/types'
import { UserPayload } from '@/store/types/UserPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

// TODO: Confirm the response payload
type DeleteProfile = UserAction<{}, UserPayload>

export const deleteProfile: DeleteProfile = async () => {
  let response
  try {
    response = await api.remove('users/profile', {})
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.PROFILE_DELETE)
  }

  return response
}
