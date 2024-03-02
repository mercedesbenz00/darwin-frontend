import { AuthAction } from '@/store/modules/auth/types'
import { constructError, getToken } from '@/utils'
import { confirm2fa as request } from '@/utils/backend'

export type Confirm2faActionParams = {
  email: string
  password: string
  token: string
} | { token: string }

type Confirm2fa = AuthAction<Confirm2faActionParams, {}>

/**
 * Request 2fa secret key to the backend
 */
export const confirm2fa: Confirm2fa = async (_, params) => {
  if ('email' in params) {
    const response = await request(params)
    return response
  }

  const accessToken = getToken()
  if (accessToken) {
    const response = await request({
      access_token: accessToken,
      token: params.token
    })
    return response
  }

  return constructError('AUTH_CONFIRM_2FA')
}
