import { AuthMutation, TfaCredentials } from '@/store/modules/auth/types'

type Params = TfaCredentials | null

export const SET_2FA_CREDENTIALS: AuthMutation<Params> = (state, params) => {
  state.tfaCredentials = params
}
