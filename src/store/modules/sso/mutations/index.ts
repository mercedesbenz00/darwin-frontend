import { MutationTree } from 'vuex'

import { SSOState } from '@/store/modules/sso/state'

import { SET_CONFIG } from './SET_CONFIG'

export const mutations: MutationTree<SSOState> = {
  SET_CONFIG
}
