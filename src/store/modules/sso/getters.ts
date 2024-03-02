import { GetterTree } from 'vuex'

import { RootState } from '@/store/types'

import { SSOState } from './state'

export const getters: GetterTree<SSOState, RootState> = {
  hasConfig: (state): boolean => {
    return !!state.config
  }
}
