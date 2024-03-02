import { SSOMutation } from '@/store/modules/sso/types'

export const SET_CONFIG: SSOMutation = (state, config: string) => {
  state.config = config
}
