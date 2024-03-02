import { Setup2FAResponsePayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  email: string
  password: string
} | {
  // eslint-disable-next-line camelcase
  access_token: string
}
type Response = Setup2FAResponsePayload

export const setup2fa = async (params?: Params) => {
  const path = 'users/setup_2fa'

  try {
    const response = await post<Response>(path, params)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_SETUP_2FA)
  }
}
