import { Login2FAResponsePayload } from '@/store/types'

type Params = Partial<Login2FAResponsePayload>

export const buildLogin2faResponsePayload = (params: Params = {}): Login2FAResponsePayload => ({
  required_2fa: true,
  set_up_2fa: false,
  ...params
})
