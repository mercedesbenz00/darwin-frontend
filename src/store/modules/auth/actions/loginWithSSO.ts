import { AuthAction } from '@/store/modules/auth/types'
import { loginSSO as request } from '@/utils/backend'

export type LoginWithSSOParams = {
  teamName: string
}

type loginWithSSO = AuthAction<LoginWithSSOParams, void>

/**
 * Update URL to get redirect to SSO
 * it will end up with /sso/saml/exchange
 * and ssoExchangeGuard from navigationGuards.ts will handle it
 */
export const loginWithSSO: loginWithSSO = (_, params) => {
  request(params)
}
