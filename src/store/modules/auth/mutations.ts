import { MutationTree } from 'vuex'

import { copyAttributes } from '@/utils'

import { SET_2FA_CREDENTIALS } from './mutations/SET_2FA_CREDENTIALS'
import { AuthState, getInitialState } from './state'

export const mutations: MutationTree<AuthState> = {
  SET_2FA_CREDENTIALS,

  SET_AUTHENTICATED (state, authenticated) {
    state.authenticated = !!authenticated
  },

  SET_ABILITIES (state, abilities) {
    state.abilities = abilities
  },

  SET_INVITATION (state, invitation) {
    state.invitation = invitation
  },

  RESET_ALL (state) {
    copyAttributes(state, getInitialState())
  }
}
