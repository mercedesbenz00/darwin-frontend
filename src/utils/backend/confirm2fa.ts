import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  email: string
  password: string
  token: string
} | {
  // eslint-disable-next-line camelcase
  access_token: string
  token: string
}
type Response = {}

export const confirm2fa = async (params: Params) => {
  const path = 'users/confirm_2fa'

  try {
    const response = await post<Response>(path, params)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_CONFIRM_2FA)
  }
}
