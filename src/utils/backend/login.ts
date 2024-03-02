import {
  Login2FAResponsePayload,
  LoginResponsePayload
} from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  email: string
  password: string
}
type Response = Login2FAResponsePayload | LoginResponsePayload

export const login = async (params: Params) => {
  const { email, password } = params
  const path = 'users/authenticate'

  try {
    const response = await post<Response>(path, { email, password })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    if (error.response?.status === 403) {
      const reason = error.response?.data.errors.message
      return parseError(
        error,
        typeof reason === 'string'
          ? { default: reason }
          : errorMessages.AUTH_LOGIN)
    }

    return parseError(error, errorMessages.AUTH_LOGIN)
  }
}
