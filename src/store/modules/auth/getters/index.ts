import { GetterTree } from 'vuex'

import { AuthState } from '@/store/modules/auth/state'
import { RootState } from '@/store/types'

import { isAuthorized } from './isAuthorized'

export const getters: GetterTree<AuthState, RootState> = {
  isAuthorized
}
