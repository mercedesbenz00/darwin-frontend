import { LoginResponsePayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  email: string
  password: string
  token: string
}

export const login2fa = async (params: Params) => {
  const { email, password, token } = params
  const path = 'users/authenticate/2fa'

  try {
    const response = await post<LoginResponsePayload>(path, { email, password, token })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_CONFIRM_2FA)
  }
}
