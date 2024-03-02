import { AuthAction } from '@/store/modules/auth/types'
import { Setup2FAResponsePayload } from '@/store/types'
import { constructError, getToken } from '@/utils'
import { setup2fa as request } from '@/utils/backend'

type Setup2fa = AuthAction<void, Setup2FAResponsePayload>

/**
 * Request 2fa secret key to the backend
 */
export const setup2fa: Setup2fa = async ({ state }) => {
  if (state.tfaCredentials) {
    const { email, password } = state.tfaCredentials
    const response = await request({ email, password })
    return response
  }

  const token = getToken()
  if (token) {
    const response = await request({ access_token: token })
    return response
  }

  return constructError('AUTH_SETUP_2FA')
}
