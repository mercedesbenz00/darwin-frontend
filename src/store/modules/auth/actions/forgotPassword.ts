import { AuthAction } from '@/store/modules/auth/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type ForgotPasswordActionParams = {
  email: string
}

export type ForgotPasswordActionResponse = {
  email: string
}

type ForgotPassword = AuthAction<ForgotPasswordActionParams, ForgotPasswordActionResponse>

/**
 * Login With Email & Password
 * @param email Email to login with
 * @param password Password to login with
 * @param rememberMe Indicates if token should be stored permanently
 */
export const forgotPassword: ForgotPassword = async (_, params) => {
  let response

  try {
    response = await api.post('users/request_password_reset', { email: params.email })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_FORGOT_PASSWORD)
  }

  return response
}
